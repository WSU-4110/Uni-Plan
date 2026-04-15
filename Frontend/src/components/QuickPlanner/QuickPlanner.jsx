import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import ComparePlans from "../ComparePlans/ComparePlans";

const TERM_MAP = {
  "Spring/Summer 2026": 202601,
  "Fall 2026": 202609,
};

const PLANS_PER_PAGE = 3;
const MAX_PLANS = 50;
const NO_MORNING_START_TIME = 12 * 60;
const NO_TIME_CONSTRAINT = 0;
const MAX_COMBINATIONS = 40;

function getDefaultPlannerGroups() {
  return [{ id: 1, name: "Group 1", courseOptions: {} }];
}

function normalizeCourse(raw) {
  return {
    ...raw,
    number: raw.courseNumber ?? raw.number ?? "",
    meetingDays: raw.days ?? raw.meetingDays ?? "TBA",
    meetingTime: raw.time ?? raw.meetingTime ?? "TBA",
  };
}

function getGroupMeta(course) {
  const subject = String(course.subject || "").trim().toUpperCase();
  const courseNumber = String(course.courseNumber ?? course.number ?? "").trim();
  if (subject && courseNumber) {
    return {
      key: `${subject}-${courseNumber}`,
      label: `${subject}${courseNumber}`,
    };
  }

  const courseCode = String(course.courseCode || "").trim();
  const matched = courseCode.match(/^([A-Za-z]+)\s*([0-9A-Za-z]+)$/);
  if (matched) {
    const parsedSubject = matched[1].toUpperCase();
    const parsedNumber = matched[2];
    return {
      key: `${parsedSubject}-${parsedNumber}`,
      label: `${parsedSubject}${parsedNumber}`,
    };
  }

  return {
    key: courseCode || String(course.crn || Math.random()),
    label: courseCode || "Course",
  };
}

function parseCourseIdentifier(section) {
  const subject = String(section.subject || "").trim();
  const courseNumber = String(section.courseNumber ?? section.number ?? "").trim();
  if (subject && courseNumber) {
    return { subject: subject.toUpperCase(), course_number: courseNumber };
  }

  const courseCode = String(section.courseCode || "").trim();
  const matched = courseCode.match(/^([A-Za-z]+)\s*([0-9A-Za-z]+)$/);
  if (!matched) return null;

  return {
    subject: matched[1].toUpperCase(),
    course_number: matched[2],
  };
}

function cartesianProduct(arrays) {
  return arrays.reduce(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]]
  );
}

function buildConstraints(preferNoFriday, preferNoMorning) {
  const days = [];
  if (preferNoFriday) days.push("friday");

  const startTime = preferNoMorning ? NO_MORNING_START_TIME : NO_TIME_CONSTRAINT;
  return { days, startTime };
}

function buildSectionLookup(plannerGroups) {
  const byCourseId = new Map();

  plannerGroups.forEach((group) => {
    Object.values(group.courseOptions).forEach((sections) => {
      sections.forEach((section) => {
        if (section.courseId) byCourseId.set(section.courseId, section);
      });
    });
  });

  return { byCourseId };
}

function normalizeWeekDaysFromSlot(slot) {
  let days = "";
  if (slot?.monday) days += "M";
  if (slot?.tuesday) days += "T";
  if (slot?.wednesday) days += "W";
  if (slot?.thursday) days += "R";
  if (slot?.friday) days += "F";
  return days || "TBA";
}

function toDisplayTime(totalMin) {
  if (typeof totalMin !== "number") return "";
  const h24 = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}

function normalizeMeetingTimeFromSlot(slot) {
  if (!slot || typeof slot.start_min !== "number" || typeof slot.end_min !== "number") {
    return "TBA";
  }
  return `${toDisplayTime(slot.start_min)} - ${toDisplayTime(slot.end_min)}`;
}

function hydrateSchedules(rawSchedules, plannerGroups) {
  const { byCourseId } = buildSectionLookup(plannerGroups);
  return (rawSchedules || [])
    .map((schedule) =>
      schedule
        .map((item) => {
          const matched = byCourseId.get(item.course_id);
          if (matched) return matched;

          return {
            crn: `gen-${item.course_id}-${item.time_slot?.start_min ?? "na"}-${item.time_slot?.end_min ?? "na"}`,
            courseId: item.course_id,
            courseCode: `COURSE ${item.course_id}`,
            name: `Course ${item.course_id}`,
            instructor: "TBA",
            meetingDays: normalizeWeekDaysFromSlot(item.time_slot),
            meetingTime: normalizeMeetingTimeFromSlot(item.time_slot),
            credits: 0,
          };
        })
        .filter(Boolean)
    )
    .filter((schedule) => schedule.length > 0);
}

export default function QuickPlanner({
  onClose,
  onApplyPlan,
  savedPlans,
  onSavePlans,
  savedPlannerState,
  onSavePlannerState,
}) {
  const [courseSubject, setCourseSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [crnSearch, setCrnSearch] = useState("");
  const [term, setTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [plannerGroups, setPlannerGroups] = useState(
    Array.isArray(savedPlannerState?.plannerGroups) && savedPlannerState.plannerGroups.length > 0
      ? savedPlannerState.plannerGroups
      : getDefaultPlannerGroups()
  );
  const [activeGroupId, setActiveGroupId] = useState(
    Number.isInteger(savedPlannerState?.activeGroupId) ? savedPlannerState.activeGroupId : 1
  );
  const [selectedSearchKeys, setSelectedSearchKeys] = useState({});
  const [preferNoFriday, setPreferNoFriday] = useState(!!savedPlannerState?.preferNoFriday);
  const [preferNoMorning, setPreferNoMorning] = useState(!!savedPlannerState?.preferNoMorning);
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
    if (!Array.isArray(plannerGroups) || plannerGroups.length === 0) {
      setPlannerGroups(getDefaultPlannerGroups());
      setActiveGroupId(1);
      return;
    }

    if (!plannerGroups.some((group) => group.id === activeGroupId)) {
      setActiveGroupId(plannerGroups[0].id);
    }
  }, [plannerGroups, activeGroupId]);

  useEffect(() => {
    onSavePlannerState?.({
      plannerGroups,
      activeGroupId,
      preferNoFriday,
      preferNoMorning,
    });
  }, [plannerGroups, activeGroupId, preferNoFriday, preferNoMorning, onSavePlannerState]);

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
    setSearchLoading(true);
    try {
      const subj = courseSubject.trim();
      const num = courseNumber.trim();
      const crn = crnSearch.trim();
      const q = crn || num || subj;

      const params = new URLSearchParams({ limit: "200" });
      if (q) params.set("q", q);
      const termId = TERM_MAP[term];
      if (termId) params.set("term_id", termId);
      const res = await fetch(`/api/courses/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      let results = (data.results ?? []).map(normalizeCourse);
      if (subj) {
        results = results.filter((c) =>
          (c.subject || "").toLowerCase().includes(subj.toLowerCase())
        );
      }
      if (num) {
        results = results.filter((c) =>
          (c.courseNumber ?? c.number ?? "").toLowerCase().includes(num.toLowerCase())
        );
      }
      if (crn) {
        results = results.filter((c) => (c.crn || "").includes(crn));
      }
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const groupedResults = useMemo(() => {
    const groups = {};
    for (const c of searchResults) {
      const { key, label } = getGroupMeta(c);
      if (!groups[key])
        groups[key] = {
          key,
          shortLabel: label,
          courseCode: key,
          name: c.name,
          credits: c.credits,
          sections: [],
        };
      groups[key].sections.push(c);
    }
    return Object.values(groups);
  }, [searchResults]);

  const toggleSearchCourse = (group) => {
    setSelectedSearchKeys((prev) => {
      const next = { ...prev };
      if (next[group.courseCode]) delete next[group.courseCode];
      else next[group.courseCode] = true;
      return next;
    });
  };

  const addGroup = () => {
    setPlannerGroups((prev) => {
      const nextId = (prev[prev.length - 1]?.id ?? 0) + 1;
      const next = [...prev, { id: nextId, name: `Group ${nextId}`, courseOptions: {} }];
      setActiveGroupId(nextId);
      return next;
    });
  };

  const removeGroup = (groupId) => {
    setPlannerGroups((prev) => {
      const next = prev.filter((g) => g.id !== groupId);
      if (next.length === 0) {
        setActiveGroupId(1);
        return [{ id: 1, name: "Group 1", courseOptions: {} }];
      }
      if (!next.some((g) => g.id === activeGroupId)) {
        setActiveGroupId(next[0].id);
      }
      return next;
    });
  };

  const addSelectedToActiveGroup = () => {
    const selectedKeys = Object.keys(selectedSearchKeys);
    if (selectedKeys.length === 0) return;

    const groupMap = Object.fromEntries(groupedResults.map((g) => [g.courseCode, g.sections]));
    setPlannerGroups((prev) =>
      prev.map((group) => {
        if (group.id !== activeGroupId) return group;
        const nextOptions = { ...group.courseOptions };
        selectedKeys.forEach((key) => {
          const sections = groupMap[key];
          if (sections?.length) nextOptions[key] = sections;
        });
        return { ...group, courseOptions: nextOptions };
      })
    );
    setSelectedSearchKeys({});
  };

  const removeCourseFromGroup = (groupId, courseKey) => {
    setPlannerGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const nextOptions = { ...group.courseOptions };
        delete nextOptions[courseKey];
        return { ...group, courseOptions: nextOptions };
      })
    );
  };

  const handleGenerate = useCallback(async () => {
    const configuredGroups = plannerGroups.filter(
      (group) => Object.keys(group.courseOptions).length > 0
    );
    if (configuredGroups.length === 0) return;

    const optionSets = configuredGroups.map((group) =>
      Object.entries(group.courseOptions)
        .map(([courseKey, sections]) => {
          const identifier = parseCourseIdentifier(sections[0]);
          if (!identifier) return null;
          return { ...identifier, courseKey, groupId: group.id };
        })
        .filter(Boolean)
    );
    if (optionSets.some((set) => set.length === 0)) return;

    const combinations = cartesianProduct(optionSets).slice(0, MAX_COMBINATIONS);
    if (combinations.length === 0) return;

    setGenerating(true);
    try {
      const constraints = buildConstraints(preferNoFriday, preferNoMorning);
      const mergedPlans = [];
      const seenSchedules = new Set();

      for (const combination of combinations) {
        if (mergedPlans.length >= MAX_PLANS) break;
        const response = await fetch("/api/generator/generate-schedules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courses: combination.map(({ subject, course_number }) => ({
              subject,
              course_number,
            })),
            days: constraints.days,
            startTime: constraints.startTime,
          }),
        });
        if (!response.ok) continue;
        const data = await response.json();
        const hydrated = hydrateSchedules(data.schedules, plannerGroups);
        for (const schedule of hydrated) {
          const signature = schedule
            .map((c) => String(c.crn || c.courseId || c.courseCode))
            .sort()
            .join("|");
          if (seenSchedules.has(signature)) continue;
          seenSchedules.add(signature);
          mergedPlans.push(schedule);
          if (mergedPlans.length >= MAX_PLANS) break;
        }
      }
      const valid = mergedPlans.slice(0, MAX_PLANS);

      setPlans(valid);
      setPageIndex(0);
      setHasGenerated(true);
      setCompareSelection([]);
      setShowCompare(false);
      onSavePlans?.(valid);
    } catch {
      setPlans([]);
      setHasGenerated(true);
      setCompareSelection([]);
      setShowCompare(false);
      onSavePlans?.([]);
    } finally {
      setGenerating(false);
    }
  }, [plannerGroups, preferNoFriday, preferNoMorning, onSavePlans]);

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
  const configuredGroupCount = plannerGroups.filter(
    (group) => Object.keys(group.courseOptions).length > 0
  ).length;

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

            <div className="flex flex-wrap gap-2 mb-3">
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
                id="quick-planner-subject-input"
                type="text"
                placeholder="Course Subject"
                value={courseSubject}
                onChange={(e) => setCourseSubject(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label="Course subject"
                className="flex-1 min-w-[9rem] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              />
              <input
                id="quick-planner-number-input"
                type="text"
                placeholder="Course Number"
                value={courseNumber}
                onChange={(e) => setCourseNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label="Course number"
                className="flex-1 min-w-[9rem] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              />
              <input
                id="quick-planner-crn-input"
                type="text"
                placeholder="CRN"
                value={crnSearch}
                onChange={(e) => setCrnSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                aria-label="CRN"
                className="flex-1 min-w-[8rem] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading}
                className="px-4 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] disabled:opacity-50 text-white text-sm font-medium rounded-md transition whitespace-nowrap"
              >
                {searchLoading ? "..." : "Search"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <select
                value={activeGroupId}
                onChange={(e) => setActiveGroupId(Number(e.target.value))}
                className="px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              >
                {plannerGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSelectedToActiveGroup}
                disabled={Object.keys(selectedSearchKeys).length === 0}
                className="px-3 py-2 bg-[#1e3a5f] hover:bg-[#152a45] disabled:opacity-40 text-white text-sm font-medium rounded-md transition"
              >
                Add selected to {plannerGroups.find((g) => g.id === activeGroupId)?.name || "group"}
              </button>
              <button
                type="button"
                onClick={addGroup}
                className="px-3 py-2 border border-[#0F3B2E] text-[#0F3B2E] text-sm font-medium rounded-md hover:bg-[#f0fdf4] transition"
              >
                New group
              </button>
            </div>

            {/* Search results grouped by courseCode */}
            {groupedResults.length > 0 && (
              <div className="border border-[#e2e8f0] rounded-lg max-h-48 overflow-y-auto divide-y divide-[#f1f5f9]">
                {groupedResults.map((g) => (
                  <label
                    key={g.courseCode}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f8fafc] transition ${
                      selectedSearchKeys[g.courseCode] ? "bg-[#f0fdf4]" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedSearchKeys[g.courseCode]}
                      onChange={() => toggleSearchCourse(g)}
                      className="w-4 h-4 accent-[#0F3B2E] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#1e293b]">
                        {g.shortLabel || g.courseCode}
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

            {/* User-defined groups */}
            {plannerGroups.length > 0 && (
              <div className="space-y-2 mt-3">
                {plannerGroups.map((group) => {
                  const entries = Object.entries(group.courseOptions);
                  const isActiveGroup = group.id === activeGroupId;
                  return (
                    <div
                      key={group.id}
                      onClick={() => setActiveGroupId(group.id)}
                      className={`border-2 rounded-lg p-3 transition cursor-pointer ${
                        isActiveGroup
                          ? "border-[#0F3B2E] bg-[#ecfdf5] shadow-sm"
                          : "border-[#e2e8f0] bg-[#f8fafc] hover:border-[#94a3b8]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#1e293b]">
                          {group.name} ({entries.length} option{entries.length !== 1 ? "s" : ""})
                          {isActiveGroup && (
                            <span className="ml-2 text-xs font-medium text-[#0F3B2E]">
                              Active
                            </span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGroup(group.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          X
                        </button>
                      </div>
                      {entries.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {entries.map(([courseKey, sections]) => (
                            <span
                              key={courseKey}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F3B2E] text-white text-xs font-medium rounded-full"
                            >
                              {courseKey} ({sections.length})
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCourseFromGroup(group.id, courseKey);
                                }}
                                className="ml-0.5 hover:text-red-200 transition"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#64748b] mt-2">
                          Add one or more course options to this group.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Preferences */}
          {configuredGroupCount > 0 && (
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
          {configuredGroupCount > 0 && (
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
