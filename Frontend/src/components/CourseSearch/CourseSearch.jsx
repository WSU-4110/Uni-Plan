import { useState, useMemo } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import CourseDetails from "../CourseDetails/CourseDetails";
import { findConflictingCourses } from "../../utils/courseUtils";

const TERM_ID = {
  "Spring/Summer 2026": 2261,
  "Fall 2026": 2270,
};

const MOCK_COURSES = [
  {
    courseId: 1,
    termId: TERM_ID["Spring/Summer 2026"],
    name: "Intro to Computer Science",
    crn: "12345",
    subject: "CSC",
    number: "1010",
    keyword: "programming",
    term: "Spring/Summer 2026",
    courseCode: "CSC 1010",
    meetingDays: "MW",
    meetingTime: "10:00 AM",
    credits: 3,
    instructor: "Dr. Smith",
    relevance: 85,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "No Prerequisite course information available",
    description:
      "An introduction to programming using Python for students with no programming experience. Basic control structures (sequence, selection, repetition) and all core data types using objects. Practice on core data structures (string, list, tuple, dictionary, and set). Design, implementation and testing of programs to solve problems with an emphasis on data manipulation using real world, practical examples.",
    building: "General Lectures",
    room: "0150",
  },
  {
    courseId: 2,
    termId: TERM_ID["Fall 2026"],
    name: "Database",
    crn: "67890",
    subject: "CSC",
    number: "3100",
    keyword: "algorithms",
    term: "Fall 2026",
    courseCode: "CSC 3100",
    meetingDays: "TR",
    meetingTime: "2:00 PM",
    credits: 3,
    instructor: "Dr. Jones",
    relevance: 72,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "CS 1010  Minimum grade of C May not be taken concurrently",
    description: "Topics include: database concepts, ER modeling, schemas and constraints, SQL and relational algebra, web-based database applications, triggers and views, physical organization and indexing, query processing, query optimization, NoSQL databases.",
    building: "M. Roy Wilson State Hall",
    room: "3209",
  },
  {
    courseId: 3,
    termId: TERM_ID["Spring/Summer 2026"],
    name: "Calculus I",
    crn: "11111",
    subject: "MATH",
    number: "1800",
    keyword: "calculus",
    term: "Spring/Summer 2026",
    courseCode: "MATH 1800",
    meetingDays: "MWF",
    meetingTime: "9:00 AM",
    credits: 4,
    instructor: "Dr. Lee",
    relevance: 60,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "MATH 1070  Minimum grade of C May not be taken concurrently",
    description: "Calculus as the study of change. Definitions, concepts, and interpretations of the derivative and the definite and indefinite integrals; differentiation, integration, applications.",
    building: "M. Roy Wilson State Hall",
    room: "1209",
  },
  {
    courseId: 4,
    termId: TERM_ID["Fall 2026"],
    name: "English Composition",
    crn: "22222",
    subject: "ENG",
    number: "1010",
    keyword: "writing",
    term: "Fall 2026",
    courseCode: "ENG 1010",
    meetingDays: "TR",
    meetingTime: "11:00 AM",
    credits: 3,
    instructor: "Dr. Brown",
    relevance: 55,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "No Prerequisite course information available",
    description: "A course in reading, research, and writing skills that prepares students to write successfully in college classes.",
    building: "Old Main",
    room: "0171",
  },
  {
    courseId: 5,
    termId: TERM_ID["Spring/Summer 2026"],
    name: "Physics I",
    crn: "33333",
    subject: "PHY",
    number: "2010",
    keyword: "mechanics",
    term: "Spring/Summer 2026",
    courseCode: "PHY 2010",
    meetingDays: "MWF",
    meetingTime: "1:00 PM",
    credits: 4,
    instructor: "Dr. Smith",
    relevance: 68,
    section: "001",
    corequisites: "PHY 2011 (The experimental lab that goes with this course)",
    prerequisites: "MATH 1800  Minimum grade of C- May not be taken concurrently",
    description: "For students specializing in physics, biology, chemistry, mathematics or engineering. Statics, kinematics, dynamics, energy and linear momentum, rotational kinematics and dynamics, angular momentum, solids and fluids, vibrations and wave motion, thermodynamics.",
    building: "Science Hall",
    room: "1117",
  },
  {
    courseId: 6,
    termId: TERM_ID["Fall 2026"],
    name: "Algorithms",
    crn: "44444",
    subject: "CSC",
    number: "5800",
    keyword: "complexity",
    term: "Fall 2026",
    courseCode: "CSC 5800",
    meetingDays: "MW",
    meetingTime: "3:00 PM",
    credits: 3,
    instructor: "Dr. Jones",
    relevance: 90,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "CS 1010  Minimum grade of C",
    description: "Formal techniques to support design and analysis of algorithms: underlying mathematical theory and practical considerations of efficiency. Topics include asymptotic complexity bounds, techniques of analysis, algorithmic strategies, advanced data and file structures, and introduction to automata theory and its application to language translation.",
    building: "M. Roy Wilson State Hall",
    room: "2216",
  },
  {
    courseId: 7,
    termId: TERM_ID["Spring/Summer 2026"],
    name: "Software Engineering",
    crn: "55555",
    subject: "CSC",
    number: "2050",
    keyword: "software",
    term: "Spring/Summer 2026",
    courseCode: "CSC 2050",
    meetingDays: "MW",
    meetingTime: "10:30 AM",
    credits: 3,
    instructor: "Dr. Williams",
    relevance: 78,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "CSC 1010  Minimum grade of C",
    description: "Principles of software engineering including requirements analysis, design, implementation, testing, and maintenance. Software lifecycle models, software project management, software quality assurance.",
    building: "M. Roy Wilson State Hall",
    room: "3105",
  },
  {
    courseId: 8,
    termId: TERM_ID["Spring/Summer 2026"],
    name: "Calculus II",
    crn: "66666",
    subject: "MATH",
    number: "2010",
    keyword: "calculus",
    term: "Spring/Summer 2026",
    courseCode: "MATH 2010",
    meetingDays: "MWF",
    meetingTime: "9:30 AM",
    credits: 4,
    instructor: "Dr. Patel",
    relevance: 65,
    section: "001",
    corequisites: "No Corequisite course information available",
    prerequisites: "MATH 1800  Minimum grade of C",
    description: "Techniques and applications of integration; infinite series including convergence tests, power series, and Taylor series; polar coordinates; parametric equations.",
    building: "M. Roy Wilson State Hall",
    room: "1410",
  },
  {
    courseId: 9,
    termId: TERM_ID["Spring/Summer 2026"],
    name: "Physics II",
    crn: "77777",
    subject: "PHY",
    number: "2020",
    keyword: "electromagnetism",
    term: "Spring/Summer 2026",
    courseCode: "PHY 2020",
    meetingDays: "MWF",
    meetingTime: "1:20 PM",
    credits: 4,
    instructor: "Dr. Kim",
    relevance: 70,
    section: "001",
    corequisites: "PHY 2021 (Lab)",
    prerequisites: "PHY 2010  Minimum grade of C-",
    description: "Electricity and magnetism, wave optics, modern physics. For students specializing in physics, biology, chemistry, mathematics or engineering.",
    building: "Science Hall",
    room: "1220",
  },
];

const SORT_OPTIONS = [
  { value: "courseCode", label: "Course Code" },
  { value: "meetingTime", label: "Meeting Time" },
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

export default function CourseSearch({ registered = [], onAddCourse, onRemoveCourse, conflicts = new Set() }) {
  const [courseSubject, setCourseSubject] = useState("");
  const [courseNumber, setCourseNumber] = useState("");
  const [crnSearch, setCrnSearch] = useState("");

  const [term, setTerm] = useState("");
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

  const handleSearch = () => setHasSearched(true);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleDay = (day) => {
    setFilterDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const showError = (message) => setErrorMessage(message);

  const isRegistered = (course) => registered.some((c) => c.crn === course.crn);

  const handleAddCourse = (course) => {
    if (isRegistered(course)) {
      onRemoveCourse?.(course);
      return;
    }
    if (totalCredits + course.credits > 18) {
      showError("Error: Cannot exceed 18 credits.");
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

  function openCourse(course) {
    setSelectedCourse(course);
  }

  function closeCourse() {
    setSelectedCourse(null);
  }

  const activeFilters = useMemo(() => {
    const f = [];
    if (filterDays.length) f.push(...filterDays);
    if (filterCredits) f.push(`${filterCredits} credits`);
    if (filterInstructor) f.push(filterInstructor);
    if (term) f.push(term);
    return f;
  }, [filterDays, filterCredits, filterInstructor, term]);

  const results = useMemo(() => {
    const subjectQ = courseSubject.trim().toLowerCase();
    const numberQ = courseNumber.trim().toLowerCase();
    const crnQ = crnSearch.trim().toLowerCase();

    return MOCK_COURSES.filter((c) => {
      if (term && c.term !== term) return false;

      if (subjectQ && !c.subject.toLowerCase().includes(subjectQ)) return false;
      if (numberQ && !c.number.toLowerCase().includes(numberQ)) return false;
      if (crnQ && !c.crn.toLowerCase().includes(crnQ)) return false;

      if (filterDays.length) {
        const hasDay = filterDays.some((d) => c.meetingDays.includes(d));
        if (!hasDay) return false;
      }
      if (filterCredits) {
        if (String(c.credits) !== String(filterCredits)) return false;
      }
      if (filterInstructor) {
        if (!c.instructor.toLowerCase().includes(filterInstructor.toLowerCase())) return false;
      }
      return true;
    });
  }, [courseSubject, courseNumber, crnSearch, term, filterDays, filterCredits, filterInstructor]);

  const sortedResults = useMemo(() => sortResults(results, sortBy, sortOrder), [results, sortBy, sortOrder]);

  return (
    <div className="space-y-4">
      <ErrorMessage message={errorMessage} onClose={() => setErrorMessage("")} />
      <ErrorMessage message={conflictMessage} onClose={() => setConflictMessage("")} type="warning" />

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="absolute inset-0 bg-black/40" onClick={closeCourse} />
          <div className="relative z-10 w-full max-w-3xl px-4">
            <CourseDetails course={selectedCourse} onClose={closeCourse} />
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
              className="px-4 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] text-white text-sm font-medium rounded-md transition whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {(hasSearched || courseSubject || courseNumber ||crnSearch || term || filterDays.length > 0 || filterCredits || filterInstructor) && (
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

      {(hasSearched || courseSubject || courseNumber || crnSearch || term || filterDays.length > 0 || filterCredits || filterInstructor) && (
        <div className="flex flex-col gap-3">
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
                      <span className="text-xs text-[#64748b]">{course.term}</span>
                      {hasConflict && (
                        <span className="text-xs font-semibold text-red-600 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full">
                          ⚠ Conflict
                        </span>
                      )}
                    </div>

                    <p onClick={() => openCourse(course)} className="text-base font-semibold text-[#1e293b] hover:underline underline-offset-4 cursor-pointer">{course.name}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-sm text-[#475569]">📅 {course.meetingDays} · {course.meetingTime}</span>
                      <span className="text-sm text-[#475569]">🎓 {course.credits} credits</span>
                      <span className="text-sm text-[#475569]">👤 {course.instructor}</span>
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
        </div>
      )}
    </div>
  );
}