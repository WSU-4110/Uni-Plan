import { useState, useMemo } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import CourseDetails from "../CourseDetails/CourseDetails";
import { findConflictingCourses } from "../../utils/courseUtils";

const TERM_MAP = {
  "Spring/Summer 2026": 202601,
  "Fall 2026": 202609,
};

const SORT_OPTIONS = [
  { value: "courseCode", label: "Course Code" },
  { value: "meetingTime", label: "Meeting Time" },
  { value: "credits", label: "Credits" },
];

const ALL_DAYS = ["M", "T", "W", "R", "F"];

function normalizeCourse(raw) {
  return {
    ...raw,
    number: raw.courseNumber ?? raw.number ?? "",
    meetingDays: raw.days ?? raw.meetingDays ?? "TBA",
    meetingTime: raw.time ?? raw.meetingTime ?? "TBA",
  };
}

function sortResults(results, sortBy, sortOrder) {
  if (!results.length) return results;
  const order = sortOrder === "asc" ? 1 : -1;
  return [...results].sort((a, b) => {
    let aVal = a[sortBy] ?? "";
    let bVal = b[sortBy] ?? "";
    if (typeof aVal === "number" && typeof bVal === "number") return order * (aVal - bVal);
    return order * String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
  });
}

export default function CourseSearch({ registered = [], onAddCourse, onRemoveCourse, conflicts = new Set() }) {
  const [courseSubject, setCourseSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [crnSearch, setCrnSearch] = useState("");
  const [term, setTerm] = useState("");

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [sortBy, setSortBy] = useState("courseCode");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filterDays, setFilterDays] = useState([]);
  const [filterCredits, setFilterCredits] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");

  const totalCredits = registered.reduce((sum, c) => sum + (c.credits || 0), 0);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const handleSearch = async () => {
    setHasSearched(true);
    setLoading(true);
    setErrorMessage("");

    try {
      const parts = [courseSubject.trim(), courseNumber.trim(), crnSearch.trim()].filter(Boolean);
      const q = parts.join(" ");

      const params = new URLSearchParams({ limit: "200" });
      if (q) params.set("q", q);
      const termId = TERM_MAP[term];
      if (termId) params.set("term_id", termId);

      const res = await fetch(`/api/courses/search?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setCourses((data.results ?? []).map(normalizeCourse));
    } catch (err) {
      setErrorMessage(err.message || "Failed to fetch courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleDay = (day) => {
    setFilterDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const isRegistered = (course) => registered.some((c) => c.crn === course.crn);

  const handleAddCourse = (course) => {
    if (isRegistered(course)) {
      onRemoveCourse?.(course);
      return;
    }
    if (totalCredits + (course.credits || 0) > 18) {
      setErrorMessage("Error: Cannot exceed 18 credits.");
      return;
    }
    const conflicting = findConflictingCourses(course, registered);
    if (conflicting.length > 0) {
      const names = conflicting.map((c) => c.courseCode).join(", ");
      setConflictMessage(`⚠ Time conflict: ${course.courseCode} overlaps with ${names}.`);
    }
    onAddCourse?.(course);
  };

  const clearFilters = () => {
    setFilterDays([]);
    setFilterCredits("");
    setFilterInstructor("");
  };

  const activeFilters = useMemo(() => {
    const f = [];
    if (filterDays.length) f.push(...filterDays);
    if (filterCredits) f.push(`${filterCredits} credits`);
    if (filterInstructor) f.push(filterInstructor);
    if (term) f.push(term);
    return f;
  }, [filterDays, filterCredits, filterInstructor, term]);

  const results = useMemo(() => {
    return courses.filter((c) => {
      if (filterDays.length && !filterDays.some((d) => (c.meetingDays || "").includes(d))) return false;
      if (filterCredits && String(c.credits) !== String(filterCredits)) return false;
      if (filterInstructor && !c.instructor.toLowerCase().includes(filterInstructor.toLowerCase())) return false;
      return true;
    });
  }, [courses, filterDays, filterCredits, filterInstructor]);

  const sortedResults = useMemo(() => sortResults(results, sortBy, sortOrder), [results, sortBy, sortOrder]);

  const showPanel = hasSearched || courseSubject || courseNumber || crnSearch || term || filterDays.length > 0 || filterCredits || filterInstructor;

  return (
    <div className="space-y-4">
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage("")} />
      <ErrorMessage message={conflictMessage} onClose={() => setConflictMessage("")} type="warning" />

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedCourse(null)} />
          <div className="relative z-10 w-full max-w-3xl px-4">
            <CourseDetails course={selectedCourse} onClose={() => setSelectedCourse(null)} />
          </div>
        </div>
      )}

      <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-base font-semibold text-[#1e293b] mb-4">Search Courses</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            id="term-select"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Select term"
            className="sm:w-52 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
          >
            <option value="">All Semesters</option>
            <option value="Spring/Summer 2026">Spring/Summer 2026</option>
            <option value="Fall 2026">Fall 2026</option>
          </select>

          <div className="flex flex-wrap items-end gap-2 flex-1">
            <input
              type="text"
              placeholder="Course Subject"
              value={courseSubject}
              onChange={(e) => setCourseSubject(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search courses"
              className="flex-1 min-w-[8rem] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
            />
            <input
              type="text"
              placeholder="Course Number"
              value={courseNumber}
              onChange={(e) => setCourseNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search courses"
              className="flex-1 min-w-[8rem] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
            />
            <input
              type="text"
              placeholder="CRN"
              value={crnSearch}
              onChange={(e) => setCrnSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search courses"
              className="flex-1 min-w-[8rem] px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] disabled:opacity-50 text-white text-sm font-medium rounded-md transition whitespace-nowrap"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </div>

      {showPanel && (
        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Filters</h3>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Meeting Days</label>
              <div className="flex gap-1 flex-wrap">
                {ALL_DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`w-8 h-8 text-sm font-medium rounded-md border transition ${
                      filterDays.includes(day)
                        ? "bg-[#0F3B2E] text-white border-[#0F3B2E]"
                        : "bg-white text-[#475569] border-[#e2e8f0] hover:border-[#0F3B2E]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="credits-select" className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Credits</label>
              <select
                id="credits-select"
                value={filterCredits}
                onChange={(e) => setFilterCredits(e.target.value)}
                aria-label="Filter by credits"
                className="px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              >
                <option value="">Any</option>
                <option value="1">1 credit</option>
                <option value="2">2 credits</option>
                <option value="3">3 credits</option>
                <option value="4">4 credits</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <label htmlFor="instructor-input" className="text-xs font-medium text-[#64748b] uppercase tracking-wide">Instructor</label>
              <input
                id="instructor-input"
                type="text"
                placeholder="Instructor name"
                value={filterInstructor}
                onChange={(e) => setFilterInstructor(e.target.value)}
                aria-label="Filter by instructor"
                className="px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
              />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#64748b]">Active:</span>
              {activeFilters.map((f) => (
                <span key={f} className="px-2.5 py-0.5 bg-[#0F3B2E] text-white text-xs rounded-full">{f}</span>
              ))}
              <button onClick={clearFilters} className="ml-1 text-xs text-[#475569] hover:text-[#0F3B2E] underline transition">Clear all</button>
            </div>
          )}
        </div>
      )}

      {showPanel && (
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex items-center justify-center text-[#64748b] text-sm">
              Loading courses…
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm text-[#64748b]">{sortedResults.length} course{sortedResults.length !== 1 ? "s" : ""} found</p>
                {sortedResults.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort-select" className="text-xs text-[#64748b]">Sort by</label>
                    <select id="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort results by" className="px-2 py-1.5 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] transition">
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} aria-label="Sort order" className="px-2 py-1.5 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] transition">
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </select>
                  </div>
                )}
              </div>

              {sortedResults.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {sortedResults.map((course) => {
                    const hasConflict = conflicts.has(course.crn);
                    return (
                      <li key={course.crn} className={`bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:shadow-md transition ${hasConflict ? "border-red-400 bg-red-50" : "border-[#e2e8f0] hover:border-[#cbd5e1]"}`}>
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-[#0F3B2E] bg-[#d1fae5] px-2 py-0.5 rounded">{course.courseCode}</span>
                            <span className="text-xs text-[#64748b]">CRN: {course.crn}</span>
                            <span className="text-xs text-[#64748b]">Term: {course.term}</span>
                            {hasConflict && (
                              <span className="text-xs font-semibold text-red-600 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
                                ⚠ Conflict
                              </span>
                            )}
                          </div>

                          <p onClick={() => setSelectedCourse(course)} className="text-base font-semibold text-[#1e293b] hover:underline underline-offset-4 cursor-pointer">{course.name}</p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="text-sm text-[#475569]">📅 {course.meetingDays} · {course.meetingTime}</span>
                            <span className="text-sm text-[#475569]">🎓 {course.credits} credits</span>
                            <span className="text-sm text-[#475569]">👤 {course.instructor}</span>
                            <span className="text-sm text-[#475569]">📍 {course.location}</span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isRegistered(course) ? (
                            <button
                              onClick={() => handleAddCourse(course)}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddCourse(course)}
                              className="px-4 py-1.5 bg-[#0F3B2E] hover:bg-[#0a2a20] text-white text-sm font-medium rounded-md transition"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-12 flex flex-col items-center justify-center text-center text-[#64748b]">
                  <p className="text-base font-medium">No courses found</p>
                  <p className="text-sm mt-1">Try adjusting your search or clearing the filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
