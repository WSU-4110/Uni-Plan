import { useState, useMemo } from "react";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import CourseDetails from "../CourseDetails/CourseDetails";


const MOCK_COURSES = [
  { name: "Intro to Computer Science", 
    crn: "12345", 
    subject: "Computer Science", 
    keyword: "programming", 
    term: "Spring/Summer 2026", 
    courseCode: "CSC 1010", 
    meetingDays: "MW", 
    meetingTime: "10:00 AM", 
    credits: 3, 
    instructor: "Dr. Smith", 
    relevance: 85, 
    section: "001" ,
    corequisites: "No Corequisite course information available" ,
    prerequisites: "No Prerequisite course information available" ,
    description: "An introduction to programming using Python for students with no programming experience. Basic control structures (sequence, selection, repetition) and all core data types using objects. Practice on core data structures (string, list, tuple, dictionary, and set). Design, implementation and testing of programs to solve problems with an emphasis on data manipulation using real world, practical examples." ,
    building: "General Lectures" ,
    room: "0150"},
  { name: "Database", 
    crn: "67890", 
    subject: "Computer Science", 
    keyword: "algorithms", 
    term: "Fall 2026", 
    courseCode: "CS 3100", 
    meetingDays: "TR", 
    meetingTime: "2:00 PM", 
    credits: 3, 
    instructor: "Dr. Jones", 
    relevance: 72, 
    section: "001" ,
    corequisites: "No Corequisite course information available" ,
    prerequisites: "CS 1010  Minimum grade of C May not be taken concurrently" ,
    description: "Topics include: database concepts, ER modeling, schemas and constraints, SQL and relational algebra, web-based database applications, triggers and views, physical organization and indexing, query processing, query optimization, NoSQL databases." ,
    building: "M. Roy Wilson State Hall" ,
    room: "3209" },
  { name: "Calculus I", 
    crn: "11111", 
    subject: "Math", 
    keyword: "calculus", 
    term: "Spring/Summer 2026", 
    courseCode: "MATH 1800", 
    meetingDays: "MWF", 
    meetingTime: "9:00 AM", 
    credits: 4, 
    instructor: "Dr. Lee", 
    relevance: 60, 
    section: "001" ,
    corequisites: "No Corequisite course information available" ,
    prerequisites: "MATH 1070  Minimum grade of C May not be taken concurrently" ,
    description: "Calculus as the study of change. Definitions, concepts, and interpretations of the derivative and the definite and indefinite integrals; differentiation, integration, applications." ,
    building: "M. Roy Wilson State Hall" ,
    room: "1209" },
  { name: "English Composition", 
    crn: "22222", 
    subject: "English", 
    keyword: "writing", 
    term: "Fall 2026", 
    courseCode: "ENG 1010", 
    meetingDays: "TR", 
    meetingTime: "11:00 AM", 
    credits: 3, 
    instructor: "Dr. Brown", 
    relevance: 55, 
    section:"001" ,
    corequisites: "No Corequisite course information available" ,
    prerequisites: "No Prerequisite course information available" ,
    description: "A course in reading, research, and writing skills that prepares students to write successfully in college classes." ,
    building: "Old Main" ,
    room: "0171" },
  { name:"Physics I" , 
    crn:"33333" , 
    subject:"Physics", 
    keyword:"mechanics" , 
    term:"Spring/Summer 2026" , 
    courseCode:"PHY 2010" , 
    meetingDays:"MWF" , 
    meetingTime:"1.00 PM" , 
    credits :4 , 
    instructor:"Dr. Smith" , 
    relevance :68 , 
    section :"001" ,
    corequisites: "PHY 2011 (The experimental lab that goes with this course)" ,
    prerequisites: "MATH 1800  Minimum grade of C- May not be taken concurrently" ,
    description: "For students specializing in physics, biology, chemistry, mathematics or engineering. Statics, kinematics, dynamics, energy and linear momentum, rotational kinematics and dynamics, angular momentum, solids and fluids, vibrations and wave motion, thermodynamics." ,
    building: "Science Hall" ,
    room: "1117" },
  { name:"Algorithms" , 
    crn:"44444" , 
    subject:"Computer Science" , 
    keyword:"complexity" , 
    term:"Fall 2026" , 
    courseCode:"CS 5800" , 
    meetingDays:"MW" , 
    meetingTime:"3.00 PM" , 
    credits :3 , 
    instructor:"Dr. Jones" , 
    relevance :90 , 
    section :"001" ,
    corequisites: "No Corequisite course information available" ,
    prerequisites: "CS 1010  Minimum grade of C MATH 1800 Minimum grade of C- May not be taken concurrently" ,
    description: "Formal techniques to support design and analysis of algorithms: underlying mathematical theory and practical considerations of efficiency. Topics include asymptotic complexity bounds, techniques of analysis, algorithmic strategies, advanced data and file structures, and introduction to automata theory and its application to language translation." ,
    building: "M. Roy Wilson State Hall" ,
    room: "2216"},
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

export default function CourseSearch() {
  const [searchText, setSearchText] = useState("");
  const [term, setTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState("courseCode");
  const [sortOrder, setSortOrder] = useState("asc");

  const [filterDays, setFilterDays] = useState([]);
  const [filterCredits, setFilterCredits] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");

  const [totalCredits, setTotalCredits] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = () => setHasSearched(true);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleDay = (day) => {
    setFilterDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const showError = (message) => {
    setErrorMessage(message);
  }

  {/*produce error when user tries to add more than 18 credits */}
  const handleAddCourse = (course) => {
    if (totalCredits + course.credits > 18) {
      showError("Error: Cannot exceed 18 credits.");
      return;
    }
    setTotalCredits(prev => prev + course.credits);
  };

  {/* produce error when co-requisite required */}

  {/* produce error when pre-requisite required */}

  {/* produce error when waitlist, possibly course,is full */}

  {/* storing clciked course to show details */}
  const [selectedCourse, setSelectedCourse] = useState(null);

  function openCourse(course) {
    setSelectedCourse(course);
    // logic to open course details page or modal
  }

  function closeCourse() {
    setSelectedCourse(null);
    // logic to close course details page or modal
  }

  const clearFilters = () => {
    setFilterDays([]);
    setFilterCredits("");
    setFilterInstructor("");
  };

  const activeFilters = [
    ...filterDays.map((d) => `Day: ${d}`),
    filterCredits ? `Credits: ${filterCredits}` : null,
    filterInstructor ? `Instructor: ${filterInstructor}` : null,
  ].filter(Boolean);

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
    <div className="max-w-4xl mx-auto flex flex-col gap-4">

      {/* Top static course links removed to avoid showing blue links */}

      {/* Error popup */}
      <ErrorMessage />

      {/* Course details modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8">
          <div className="absolute inset-0 bg-black/40" onClick={closeCourse} />
          <div className="relative z-10 w-full max-w-3xl px-4">
            <CourseDetails course={selectedCourse} onClose={closeCourse} />
          </div>
        </div>
      )}

      {/* Search card */}
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

          <div className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder="Course name, CRN, subject, or keyword"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search courses"
              className="flex-1 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
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

      {/* Filter panel */}
      {hasSearched && (
        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-[#1e293b] mb-4">Filters</h3>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            {/* Meeting days */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                Meeting Days
              </label>
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

            {/* Credits */}
            <div className="flex flex-col gap-2">
              <label htmlFor="credits-select" className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                Credits
              </label>
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

            {/* Instructor */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <label htmlFor="instructor-input" className="text-xs font-medium text-[#64748b] uppercase tracking-wide">
                Instructor
              </label>
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

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#64748b]">Active:</span>
              {activeFilters.map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-0.5 bg-[#0F3B2E] text-white text-xs rounded-full"
                >
                  {f}
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="ml-1 text-xs text-[#475569] hover:text-[#0F3B2E] underline transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {hasSearched && (
        <div className="flex flex-col gap-3">
          {/* Sort controls + count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-[#64748b]">
              {sortedResults.length} course{sortedResults.length !== 1 ? "s" : ""} found
            </p>
            {sortedResults.length > 0 && (
              <div className="flex items-center gap-2">
                <label htmlFor="sort-select" className="text-xs text-[#64748b]">Sort by</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort results by"
                  className="px-2 py-1.5 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] transition"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort order"
                  className="px-2 py-1.5 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] transition"
                >
                  <option value="asc">Asc</option>
                  <option value="desc">Desc</option>
                </select>
              </div>
            )}
          </div>

          {sortedResults.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {sortedResults.map((course, index) => (
                <li
                  key={course.crn + index}
                  className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 hover:shadow-md hover:border-[#cbd5e1] transition"
                >
                  {/* Course info */}
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#0F3B2E] bg-[#d1fae5] px-2 py-0.5 rounded">
                        {course.courseCode}
                      </span>
                      <span className="text-xs text-[#64748b]">CRN: {course.crn}</span>
                      <span className="text-xs text-[#64748b]">{course.term}</span>
                    </div>
                    {/* turning class names into link to course details page */}

                    <p
                      onClick={() => openCourse(course)}
                      className="text-base font-semibold text-[#1e293b] hover:underline underline-offset-4 cursor-pointer"
                    >
                      {course.name}
                    </p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      <span className="text-sm text-[#475569]">📅 {course.meetingDays} · {course.meetingTime}</span>
                      <span className="text-sm text-[#475569]">🎓 {course.credits} credits</span>
                      <span className="text-sm text-[#475569]">👤 {course.instructor}</span>
                    </div>
                  </div>

                  {/* Add button */}
                  <div className="flex-shrink-0">
                    <button className="px-4 py-1.5 bg-[#0F3B2E] hover:bg-[#0a2a20] text-white text-sm font-medium rounded-md transition">
                      Add
                    </button>
                  </div>
                </li>
              ))}
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
