import { useState, useMemo } from "react";

const MOCK_COURSES = [
  { name: "Intro to Computer Science", crn: "12345", subject: "CS", keyword: "programming", term: "Spring/Summer 2026", courseCode: "CS 1010", meetingTime: "MW 10:00 AM", relevance: 85 },
  { name: "Data Structures", crn: "67890", subject: "CS", keyword: "algorithms", term: "Fall 2026", courseCode: "CS 3100", meetingTime: "TR 2:00 PM", relevance: 72 },
];

function searchCourses(searchText, term) {
  const text = searchText.trim().toLowerCase();
  return MOCK_COURSES.filter((course) => {
    const matchesSearchText =
      course.name.toLowerCase().includes(text) ||
      course.crn.toLowerCase().includes(text) ||
      course.subject.toLowerCase().includes(text) ||
      course.keyword.toLowerCase().includes(text);
    const matchesTerm = term ? course.term.toLowerCase() === term.toLowerCase() : true;
    return matchesSearchText && matchesTerm;
  });
}

const SORT_OPTIONS = [
  { value: "courseCode", label: "Course code" },
  { value: "meetingTime", label: "Meeting time" },
  { value: "relevance", label: "Relevance" },
];

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
  const [results, setResults] = useState([]);
  const [sortBy, setSortBy] = useState("courseCode");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSearch = () => {
    setResults(searchCourses(searchText, term));
  };

  const sortedResults = useMemo(
    () => sortResults(results, sortBy, sortOrder),
    [results, sortBy, sortOrder]
  );

  return (
    <div style={{ padding: "20px" }}>
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

      {results.length > 0 && (
        <div style={{ marginTop: "20px" }}>
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
                <strong>{course.name}</strong> — {course.courseCode} — CRN: {course.crn} — {course.meetingTime}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.length === 0 && (
        <div style={{ marginTop: "20px" }}>
          <p>No results found.</p>
        </div>
      )}
    </div>
  );
}
