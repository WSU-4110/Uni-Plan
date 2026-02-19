import { useState, useMemo } from "react";

const MOCK_COURSES = [
  { name: "Intro to Computer Science", crn: "12345", subject: "CS", keyword: "programming", term: "Spring/Summer 2026", courseCode: "CS 1010", meetingDays: "MW", meetingTime: "10:00 AM", credits: 3, instructor: "Dr. Smith", relevance: 85 },
  { name: "Data Structures", crn: "67890", subject: "CS", keyword: "algorithms", term: "Fall 2026", courseCode: "CS 3100", meetingDays: "TR", meetingTime: "2:00 PM", credits: 3, instructor: "Dr. Jones", relevance: 72 },
  { name: "Calculus I", crn: "11111", subject: "MATH", keyword: "calculus", term: "Spring/Summer 2026", courseCode: "MATH 1800", meetingDays: "MWF", meetingTime: "9:00 AM", credits: 4, instructor: "Dr. Lee", relevance: 60 },
  { name: "English Composition", crn: "22222", subject: "ENG", keyword: "writing", term: "Fall 2026", courseCode: "ENG 1010", meetingDays: "TR", meetingTime: "11:00 AM", credits: 3, instructor: "Dr. Brown", relevance: 55 },
  { name: "Physics I", crn: "33333", subject: "PHY", keyword: "mechanics", term: "Spring/Summer 2026", courseCode: "PHY 2010", meetingDays: "MWF", meetingTime: "1:00 PM", credits: 4, instructor: "Dr. Smith", relevance: 68 },
  { name: "Algorithms", crn: "44444", subject: "CS", keyword: "complexity", term: "Fall 2026", courseCode: "CS 5800", meetingDays: "MW", meetingTime: "3:00 PM", credits: 3, instructor: "Dr. Jones", relevance: 90 },
];

const SORT_OPTIONS = [
  { value: "courseCode", label: "Course code" },
  { value: "meetingTime", label: "Meeting time" },
  { value: "relevance", label: "Relevance" },
];

const ALL_DAYS = ["M", "T", "W", "R", "F"];

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

export default function CourseSearch() {
  const [searchText, setSearchText] = useState("");
  const [term, setTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState("courseCode");
  const [sortOrder, setSortOrder] = useState("asc");

  // Filter state
  const [filterDays, setFilterDays] = useState([]);
  const [filterCredits, setFilterCredits] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");

  const handleSearch = () => {
    setHasSearched(true);
  };

  const toggleDay = (day) => {
    setFilterDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const clearFilters = () => {
    setFilterDays([]);
    setFilterCredits("");
    setFilterInstructor("");
  };

  // Active filter labels for display
  const activeFilters = [
    ...filterDays.map((d) => `Day: ${d}`),
    filterCredits ? `Credits: ${filterCredits}` : null,
    filterInstructor ? `Instructor: ${filterInstructor}` : null,
  ].filter(Boolean);

  // Apply search + filters reactively
  const filteredResults = useMemo(() => {
    if (!hasSearched) return [];

    const text = searchText.trim().toLowerCase();

    return MOCK_COURSES.filter((course) => {
      const matchesText =
        !text ||
        course.name.toLowerCase().includes(text) ||
        course.crn.includes(text) ||
        course.subject.toLowerCase().includes(text) ||
        course.keyword.toLowerCase().includes(text);

      const matchesTerm = term ? course.term === term : true;

      // Check if course meets on ALL selected days
      const matchesDays =
        filterDays.length === 0 ||
        filterDays.every((d) => course.meetingDays.includes(d));

      const matchesCredits =
        filterCredits === "" || course.credits === Number(filterCredits);

      const matchesInstructor =
        filterInstructor === "" ||
        course.instructor.toLowerCase().includes(filterInstructor.toLowerCase());

      return matchesText && matchesTerm && matchesDays && matchesCredits && matchesInstructor;
    });
  }, [hasSearched, searchText, term, filterDays, filterCredits, filterInstructor]);

  const sortedResults = useMemo(
    () => sortResults(filteredResults, sortBy, sortOrder),
    [filteredResults, sortBy, sortOrder]
  );

  return (
    <div style={{ padding: "20px" }}>
      {/* Search bar */}
      <label htmlFor="term-select">Select Semester</label>
      <select
        id="term-select"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        aria-label="Select term"
      >
        <option value="">Select a term</option>
        <option value="Spring/Summer 2026">Spring/Summer 2026</option>
        <option value="Fall 2026">Fall 2026</option>
      </select>
      <br /><br />
      <input
        type="text"
        placeholder="Course Name, CRN, Subject, or Keyword"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        aria-label="Search courses"
      />
      <button onClick={handleSearch}>Search</button>

      {/* Filter panel — shown after first search */}
      {hasSearched && (
        <div style={{ marginTop: "16px", padding: "12px", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "#f9f9f9" }}>
          <strong>Filters</strong>

          {/* Meeting days */}
          <div style={{ marginTop: "8px" }}>
            <label>Meeting Days:</label>
            <span style={{ marginLeft: "8px" }}>
              {ALL_DAYS.map((day) => (
                <label key={day} style={{ marginRight: "10px" }}>
                  <input
                    type="checkbox"
                    checked={filterDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    style={{ marginRight: "3px" }}
                  />
                  {day}
                </label>
              ))}
            </span>
          </div>

          {/* Credit hours */}
          <div style={{ marginTop: "8px" }}>
            <label htmlFor="credits-select">Credits: </label>
            <select
              id="credits-select"
              value={filterCredits}
              onChange={(e) => setFilterCredits(e.target.value)}
              aria-label="Filter by credits"
            >
              <option value="">Any</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          {/* Instructor */}
          <div style={{ marginTop: "8px" }}>
            <label htmlFor="instructor-input">Instructor: </label>
            <input
              id="instructor-input"
              type="text"
              placeholder="Instructor name"
              value={filterInstructor}
              onChange={(e) => setFilterInstructor(e.target.value)}
              aria-label="Filter by instructor"
            />
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#555" }}>Active:</span>
              {activeFilters.map((f) => (
                <span key={f} style={{ background: "#0F3B2E", color: "white", padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>
                  {f}
                </span>
              ))}
              <button onClick={clearFilters} style={{ fontSize: "12px", marginLeft: "4px", cursor: "pointer" }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div style={{ marginTop: "20px" }}>
          {sortedResults.length > 0 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                <label htmlFor="sort-select">Sort by</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort results by"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort order"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <ul>
                {sortedResults.map((course, index) => (
                  <li key={course.crn + index}>
                    <strong>{course.name}</strong> — {course.courseCode} — CRN: {course.crn} — {course.meetingDays} {course.meetingTime} — {course.credits} cr — {course.instructor}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            // No results message with suggestion to adjust filters
            <p>No courses found. Try adjusting your search or clearing filters.</p>
          )}
        </div>
      )}
    </div>
  );
}
