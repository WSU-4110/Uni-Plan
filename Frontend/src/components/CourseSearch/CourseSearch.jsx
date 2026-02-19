import { useState } from "react";

function searchCourses(searchText, term) {
  const courses = [
    { name: "Intro to Computer Science", crn: "12345", subject: "CS", keyword: "programming", term: "Spring/Summer 2026" },
    { name: "Data Structures", crn: "67890", subject: "CS", keyword: "algorithms", term: "Fall 2026" },
  ];
  const text = searchText.trim().toLowerCase();
  return courses.filter((course) => {
    const matchesSearchText =
      course.name.toLowerCase().includes(text) ||
      course.crn.toLowerCase().includes(text) ||
      course.subject.toLowerCase().includes(text) ||
      course.keyword.toLowerCase().includes(text);
    const matchesTerm = term ? course.term.toLowerCase() === term.toLowerCase() : true;
    return matchesSearchText && matchesTerm;
  });
}

export default function CourseSearch() {
  const [searchText, setSearchText] = useState("");
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    setResults(searchCourses(searchText, term));
  };

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
      <div style={{ marginTop: "20px" }}>
        {results.length > 0 ? (
          <ul>
            {results.map((course, index) => (
              <li key={index}>
                <strong>{course.name}</strong> — CRN: {course.crn} — {course.subject}
              </li>
            ))}
          </ul>
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
}
