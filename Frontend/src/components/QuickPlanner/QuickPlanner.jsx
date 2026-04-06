import { useState, useMemo, useCallback } from "react";
import {
  parseMeetingDays,
  parseTo24h,
  timeToFloat,
  estimateDuration,
} from "../../utils/courseUtils";

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
      onSavePlans?.(valid);
    }, 50);
  }, [selectedGroups, preferNoFriday, preferNoMorning, onSavePlans]);

  const totalPages = Math.ceil(plans.length / PLANS_PER_PAGE);
  const startIdx = pageIndex * PLANS_PER_PAGE;
  const visiblePlans = plans.slice(startIdx, startIdx + PLANS_PER_PAGE);
  const selectedCount = Object.keys(selectedGroups).length;

  const handleRegenerate = () => {
    setPageIndex((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[#1e293b]">
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
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
                type="text"
                placeholder="Search courses (e.g. CSC, MAT)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1e293b]">
                  Generated Plans
                </h3>
                <span className="text-xs text-[#64748b]">
                  {plans.length} plan{plans.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="space-y-3">
                {visiblePlans.map((plan, idx) => {
                  const num = startIdx + idx + 1;
                  const credits = plan.reduce(
                    (s, c) => s + (c.credits || 0),
                    0
                  );
                  return (
                    <div
                      key={startIdx + idx}
                      className="border border-[#e2e8f0] rounded-lg p-4 bg-[#f8fafc]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-[#0F3B2E]">
                          Plan {num}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#64748b]">
                            {credits} credits
                          </span>
                          <button
                            onClick={() => onApplyPlan(plan)}
                            className="px-3 py-1 bg-[#0F3B2E] hover:bg-[#0a2a20] text-white text-xs font-medium rounded-md transition"
                          >
                            Apply Plan
                          </button>
                        </div>
                      </div>
                      <ul className="space-y-1">
                        {plan.map((c) => (
                          <li
                            key={c.crn}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="font-medium text-[#1e293b] whitespace-nowrap">
                              {c.courseCode}
                            </span>
                            <span className="text-[#64748b] whitespace-nowrap">
                              {c.meetingDays} {c.meetingTime}
                            </span>
                            <span className="text-[#94a3b8] truncate">
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
    </div>
  );
}
