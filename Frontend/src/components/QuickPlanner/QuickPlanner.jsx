import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  parseMeetingDays,
  parseTo24h,
  timeToFloat,
  estimateDuration,
  formatMeetingDaysForDisplay,
} from "../../utils/courseUtils";
import ComparePlans from "../ComparePlans/ComparePlans";

const TERM_MAP = {
  "Spring/Summer 2026": 202601,
  "Fall 2026": 202609,
};

const PLANS_PER_PAGE = 3;
const MAX_PLANS = 50;

function normalizeCourse(raw) {
  return {
    ...raw,
    number: raw.courseNumber ?? raw.number ?? "",
    meetingDays: raw.days ?? raw.meetingDays ?? "TBA",
    meetingTime: raw.time ?? raw.meetingTime ?? "TBA",
  };
}

function getTimeRange(course) {
  const timeStr = course.meetingTime || course.time || "";
  if (!timeStr || timeStr === "TBA") return null;

  const parts = timeStr.split(" - ");
  if (parts.length === 2) {
    const s = timeToFloat(parseTo24h(parts[0].trim()));
    const e = timeToFloat(parseTo24h(parts[1].trim()));
    if (!isNaN(s) && !isNaN(e)) return { start: s, end: e };
  }

  const s = timeToFloat(parseTo24h(timeStr));
  if (!isNaN(s)) {
    return { start: s, end: s + estimateDuration(course.meetingDays) / 60 };
  }
  return null;
}

function sectionsOverlap(a, b) {
  const daysA = parseMeetingDays(a.meetingDays);
  const daysB = parseMeetingDays(b.meetingDays);
  if (!daysA.some((d) => daysB.includes(d))) return false;
  const ra = getTimeRange(a);
  const rb = getTimeRange(b);
  if (!ra || !rb) return false;
  return ra.start < rb.end && rb.start < ra.end;
}

function comboHasConflict(combo) {
  for (let i = 0; i < combo.length; i++) {
    for (let j = i + 1; j < combo.length; j++) {
      if (sectionsOverlap(combo[i], combo[j])) return true;
    }
  }
  return false;
}

function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]]
  );
}

export default function QuickPlanner({
  onClose,
  onApplyPlan,
  savedPlans,
  onSavePlans,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [term, setTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState({});
  const [preferNoFriday, setPreferNoFriday] = useState(false);
  const [preferNoMorning, setPreferNoMorning] = useState(false);
  const [plans, setPlans] = useState(savedPlans || []);
  const [pageIndex, setPageIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(
    Array.isArray(savedPlans) && savedPlans.length > 0
  );
  const [compareSelection, setCompareSelection] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const quickPlannerModalRef = useRef(null);

  useEffect(() => {
    const modalEl = quickPlannerModalRef.current;
    if (!modalEl) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modalEl.querySelectorAll(focusableSelector));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    (first || modalEl).focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (e.key === "Tab" && first && last) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ limit: "200" });
      params.set("q", searchQuery.trim());
      const termId = TERM_MAP[term];
      if (termId) params.set("term_id", termId);
      const res = await fetch(`/api/courses/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResults((data.results ?? []).map(normalizeCourse));
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const groupedResults = useMemo(() => {
    const groups = {};
    for (const c of searchResults) {
      const key = c.courseCode;
      if (!groups[key])
        groups[key] = {
          courseCode: key,
          name: c.name,
          credits: c.credits,
          sections: [],
        };
      groups[key].sections.push(c);
    }
    return Object.values(groups);
  }, [searchResults]);

  const toggleGroup = (group) => {
    setSelectedGroups((prev) => {
      const next = { ...prev };
      if (next[group.courseCode]) delete next[group.courseCode];
      else next[group.courseCode] = group.sections;
      return next;
    });
  };

  const removeGroup = (code) => {
    setSelectedGroups((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const handleGenerate = useCallback(() => {
    const groups = Object.values(selectedGroups);
    if (groups.length === 0) return;
    setGenerating(true);

    setTimeout(() => {
      const combos = cartesianProduct(groups);
      let valid = [];
      for (const combo of combos) {
        if (valid.length >= MAX_PLANS) break;
        if (!comboHasConflict(combo)) valid.push(combo);
      }

      if (preferNoFriday) {
        const pref = valid.filter(
          (c) => !c.some((x) => (x.meetingDays || "").includes("F"))
        );
        if (pref.length > 0) valid = pref;
      }

      if (preferNoMorning) {
        const pref = valid.filter(
          (c) =>
            !c.some((x) => {
              const r = getTimeRange(x);
              return r && r.start < 10;
            })
        );
        if (pref.length > 0) valid = pref;
      }

      setPlans(valid);
      setPageIndex(0);
      setHasGenerated(true);
      setGenerating(false);
      setCompareSelection([]);
      setShowCompare(false);
      onSavePlans?.(valid);
    }, 50);
  }, [selectedGroups, preferNoFriday, preferNoMorning, onSavePlans]);

  const toggleCompareIndex = useCallback((globalIdx) => {
    setCompareSelection((prev) => {
      if (prev.includes(globalIdx)) return prev.filter((i) => i !== globalIdx);
      if (prev.length >= 2) return prev;
      return [...prev, globalIdx];
    });
  }, []);

  useEffect(() => {
    if (compareSelection.length < 2) setShowCompare(false);
  }, [compareSelection.length]);

  const totalPages = Math.ceil(plans.length / PLANS_PER_PAGE);
  const startIdx = pageIndex * PLANS_PER_PAGE;
  const visiblePlans = plans.slice(startIdx, startIdx + PLANS_PER_PAGE);
  const selectedCount = Object.keys(selectedGroups).length;

  const handleRegenerate = () => {
    setPageIndex((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  };

  const canCompare = compareSelection.length === 2;
  const [idxA, idxB] = canCompare ? compareSelection : [null, null];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={quickPlannerModalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-planner-title"
        tabIndex={-1}
        className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[92vh] flex flex-col border border-[#e2e8f0]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-4 border-b-2 border-[#e2e8f0] bg-[#fafafa] flex-shrink-0">
          <h2 id="quick-planner-title" className="text-xl font-bold text-[#0f172a]">
            Quick Planner
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f1f5f9] transition text-[#64748b]"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
          {/* 1. Course Selection */}
          <div>
            <h3 className="text-sm font-semibold text-[#1e293b] mb-3">
              1. Select Required Courses
            </h3>

            <div className="flex gap-2 mb-3">
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                aria-label="Select term"
                className="px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              >
                <option value="">All Terms</option>
                {Object.keys(TERM_MAP).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                id="quick-planner-search-input"
                type="text"
                placeholder="Search courses (e.g. CSC, MAT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label="Search courses"
                className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="px-4 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] disabled:opacity-50 text-white text-sm font-medium rounded-md transition whitespace-nowrap"
              >
                {searchLoading ? "..." : "Search"}
              </button>
            </div>

            {/* Search results grouped by courseCode */}
            {groupedResults.length > 0 && (
              <div className="border border-[#e2e8f0] rounded-lg max-h-48 overflow-y-auto divide-y divide-[#f1f5f9]">
                {groupedResults.map((g) => (
                  <label
                    key={g.courseCode}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f8fafc] transition ${
                      selectedGroups[g.courseCode] ? "bg-[#f0fdf4]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedGroups[g.courseCode]}
                      onChange={() => toggleGroup(g)}
                      className="w-4 h-4 accent-[#0F3B2E] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#1e293b]">
                        {g.courseCode}
                      </span>
                      <span className="text-sm text-[#64748b] ml-2">
                        {g.name}
                      </span>
                    </div>
                    <span className="text-xs text-[#94a3b8] whitespace-nowrap">
                      {g.sections.length} section
                      {g.sections.length !== 1 ? "s" : ""} · {g.credits} cr
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Selected course tags */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.keys(selectedGroups).map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F3B2E] text-white text-xs font-medium rounded-full"
                  >
                    {code}
                    <button
                      onClick={() => removeGroup(code)}
                      className="ml-0.5 hover:text-red-200 transition"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 2. Preferences */}
          {selectedCount > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[#1e293b] mb-3">
                2. Preferences (optional)
              </h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferNoFriday}
                    onChange={(e) => setPreferNoFriday(e.target.checked)}
                    className="w-4 h-4 accent-[#0F3B2E]"
                  />
                  <span className="text-sm text-[#475569]">Friday Off</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferNoMorning}
                    onChange={(e) => setPreferNoMorning(e.target.checked)}
                    className="w-4 h-4 accent-[#0F3B2E]"
                  />
                  <span className="text-sm text-[#475569]">
                    No Morning Classes
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Generate button */}
          {selectedCount > 0 && (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 bg-[#C5A334] hover:bg-[#b59428] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
            >
              {generating ? "Generating Plans..." : "Generate Plans"}
            </button>
          )}

          {/* Generated plans display */}
          {hasGenerated && plans.length > 0 && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-[#0f172a]">
                  Generated Plans
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-[#475569]">
                    {plans.length} plan{plans.length !== 1 ? "s" : ""} found
                  </span>
                  {canCompare && (
                    <button
                      type="button"
                      onClick={() => setShowCompare(true)}
                      className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#152a45] text-white text-sm font-semibold rounded-lg shadow-sm transition"
                    >
                      Compare selected
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#64748b] mb-3">
                Check two plans, then open <span className="font-semibold text-[#334155]">Compare selected</span> to see them side by side.
              </p>

              <div className="space-y-3">
                {visiblePlans.map((plan, idx) => {
                  const globalIdx = startIdx + idx;
                  const num = globalIdx + 1;
                  const credits = plan.reduce(
                    (s, c) => s + (c.credits || 0),
                    0
                  );
                  const inCompare = compareSelection.includes(globalIdx);
                  const compareDisabled =
                    compareSelection.length >= 2 && !inCompare;
                  return (
                    <div
                      key={globalIdx}
                      className={`border-2 rounded-xl p-4 transition ${
                        inCompare
                          ? "border-[#1e3a5f] bg-[#eff6ff]"
                          : "border-[#e2e8f0] bg-[#f8fafc]"
                      }`}
                    >
                      <div className="flex flex-wrap items-start gap-3 mb-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                          <input
                            type="checkbox"
                            checked={inCompare}
                            disabled={compareDisabled}
                            onChange={() => toggleCompareIndex(globalIdx)}
                            className="w-4 h-4 accent-[#1e3a5f] disabled:opacity-40"
                            aria-label={`Select plan ${num} for comparison`}
                          />
                          <span className="text-sm font-semibold text-[#475569]">
                            Compare
                          </span>
                        </label>
                        <div className="flex-1 min-w-[12rem] flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-[#0F3B2E]">
                            Plan {num}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#64748b]">
                              {credits} credits
                            </span>
                            <button
                              type="button"
                              onClick={() => onApplyPlan(plan)}
                              className="px-3 py-1.5 bg-[#0F3B2E] hover:bg-[#0a2a20] text-white text-sm font-semibold rounded-md transition"
                            >
                              Apply Plan
                            </button>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2 border-t border-[#e2e8f0] pt-3">
                        {plan.map((c) => (
                          <li
                            key={c.crn}
                            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm"
                          >
                            <span className="font-bold text-[#0f172a] whitespace-nowrap">
                              {c.courseCode}
                            </span>
                            <span className="text-[#475569] whitespace-nowrap">
                              {formatMeetingDaysForDisplay(c.meetingDays)} {c.meetingTime}
                            </span>
                            <span className="text-[#64748b] text-xs truncate min-w-0">
                              {c.instructor}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Pagination + Regenerate */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-[#64748b]">
                  Showing {startIdx + 1}–
                  {Math.min(startIdx + PLANS_PER_PAGE, plans.length)} of{" "}
                  {plans.length}
                </span>
                {plans.length > PLANS_PER_PAGE && (
                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-1.5 border border-[#0F3B2E] text-[#0F3B2E] text-xs font-medium rounded-md hover:bg-[#f0fdf4] transition"
                  >
                    Regenerate
                  </button>
                )}
              </div>
            </div>
          )}

          {/* No plans found */}
          {hasGenerated && plans.length === 0 && !generating && (
            <div className="text-center py-6">
              <p className="text-sm text-[#64748b]">
                No conflict-free plans found.
              </p>
              <p className="text-xs text-[#94a3b8] mt-1">
                Try selecting different courses or adjusting preferences.
              </p>
            </div>
          )}
        </div>
      </div>

      {showCompare && canCompare && (
        <ComparePlans
          planA={plans[idxA]}
          planB={plans[idxB]}
          planNumberA={idxA + 1}
          planNumberB={idxB + 1}
          onClose={() => setShowCompare(false)}
          onSelectPlan={onApplyPlan}
        />
      )}
    </div>
  );
}
