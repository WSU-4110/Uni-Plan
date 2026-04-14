import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseSearch from "../../components/CourseSearch/CourseSearch";
import WeeklySchedule from "../../components/WeeklySchedule/WeeklySchedule";
import { detectConflicts } from "../../utils/courseUtils";
import wayneLogo from "../../assets/images/wayneLogo.png";

function normalizePlanCourse(c) {
  return {
    ...c,
    number: c.courseNumber ?? c.number ?? "",
    meetingDays: c.meetingDays ?? c.days ?? "TBA",
    meetingTime: c.meetingTime ?? c.time ?? "TBA",
  };
}

function AdminPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "";

  const [studentId, setStudentId] = useState("");
  const [courses, setCourses] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searched, setSearched] = useState(false);

  const [saveStatus, setSaveStatus] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    if (userRole !== "admin") {
      navigate("/home", { replace: true });
    }
  }, [isLoggedIn, userRole, navigate]);

  const conflicts = useMemo(() => detectConflicts(courses), [courses]);
  const totalCredits = useMemo(
    () => courses.reduce((s, c) => s + (c.credits || 0), 0),
    [courses]
  );

  const handleSearchRegistered = async () => {
    const sid = studentId.trim();
    if (!sid) { setSearchError("Enter a Student ID."); return; }

    setSearchLoading(true);
    setSearchError("");
    setSearched(true);
    setCourses([]);
    setSaveStatus("");

    try {
      const params = new URLSearchParams({
        admin_user: username,
        student_id: sid,
      });
      const res = await fetch(`/api/admin/plans/registered?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setCourses((data.results ?? []).map(normalizePlanCourse));
    } catch (err) {
      setSearchError(err.message || "Failed to load registered schedule.");
      setCourses([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddCourse = (course) => {
    setCourses((prev) => [...prev, course]);
    setSaveStatus("");
  };

  const handleRemoveCourse = (course) => {
    setCourses((prev) => prev.filter((c) => c.crn !== course.crn));
    setSaveStatus("");
  };

  const handleForceSave = async () => {
    setSaveLoading(true);
    setSaveStatus("");
    try {
      const courseIds = courses.map((c) => c.courseId).filter(Boolean);
      const res = await fetch("/api/admin/plans/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_user: username,
          student_id: studentId.trim(),
          course_ids: courseIds,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server error: ${res.status}`);
      }
      setSaveStatus("Registered schedule updated!");
    } catch (err) {
      setSaveStatus(err.message || "Failed to update registered schedule.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  if (!isLoggedIn || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center text-[#64748b] text-sm">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f3] flex flex-col">
      <header className="sticky top-0 z-10 bg-[#0F3B2E] border-b border-[#0a2a20] shadow-md">
        <div className="flex items-center gap-3 px-[5%] h-[64px]">
          <img
            src={wayneLogo}
            alt="Wayne State University Logo"
            className="h-8 w-auto flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-[#a7d9cc] text-xs font-medium tracking-wide leading-none">
              WAYNE STATE UNIVERSITY
            </p>
            <h1 className="text-white text-base sm:text-lg font-semibold leading-tight">
              Admin Panel
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1a5c45] border border-[#2d7a5f] rounded-md hover:bg-[#226b52] transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-[5%] py-8 w-full max-w-6xl mx-auto">
        <p className="text-sm text-[#64748b] mb-6">
          Signed in as{" "}
          <span className="font-medium text-[#334155]">{username}</span>
        </p>

        {/* Step 1: Search student */}
        <section className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-1">
            Look up a student
          </h2>
          <p className="text-sm text-[#64748b] mb-5">
            Enter a student ID to view and edit their registered schedule.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex-1 min-w-[10rem]">
              <label htmlFor="admin-student-id" className="block text-xs font-medium text-[#64748b] mb-1">
                Student ID
              </label>
              <input
                id="admin-student-id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchRegistered()}
                placeholder="e.g. student1"
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10"
                autoComplete="off"
              />
            </div>
            <button
              onClick={handleSearchRegistered}
              disabled={searchLoading}
              className="px-5 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] disabled:opacity-50 text-white text-sm font-semibold rounded-md transition"
            >
              {searchLoading ? "Loading…" : "Search"}
            </button>
          </div>

          {searchError && (
            <p className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {searchError}
            </p>
          )}
        </section>

        {/* Registered schedule editor */}
        {searched && !searchLoading && !searchError && (
          <>
            {/* Info bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg font-semibold text-[#1e293b]">
                  {studentId.trim()}'s Registered Schedule
                </h2>
                {courses.length === 0 && (
                  <span className="text-sm text-[#94a3b8]">— no registered courses</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    totalCredits > 18
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-[#d1fae5] text-[#065f46]"
                  }`}
                >
                  {totalCredits} credits{totalCredits > 18 ? " (override)" : ""}
                </span>
                <button
                  onClick={handleForceSave}
                  disabled={saveLoading || courses.length === 0}
                  className="px-4 py-1.5 bg-[#7c2d12] hover:bg-[#6b2710] disabled:opacity-50 text-white text-sm font-medium rounded-md transition"
                >
                  {saveLoading ? "Saving…" : "Force Save"}
                </button>
                {saveStatus && (
                  <p className={`text-sm px-3 py-1.5 rounded ${
                    saveStatus.includes("updated") || saveStatus.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {saveStatus}
                  </p>
                )}
              </div>
            </div>

                {/* Main two-panel layout */}
                <div className="flex gap-4">
                  {/* Left: Course search */}
                  <div className="w-[55%] flex-shrink-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    <CourseSearch
                      registered={courses}
                      onAddCourse={handleAddCourse}
                      onRemoveCourse={handleRemoveCourse}
                      conflicts={conflicts}
                      bypassCreditLimit
                    />
                  </div>

                  {/* Right: Course list + Weekly schedule */}
                  <div className="flex-1 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    {/* Course list */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4">
                      {courses.length === 0 ? (
                        <p className="text-sm text-[#94a3b8] text-center py-4">
                          No courses in this plan. Use search to add courses.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {courses.map((course) => (
                            <li
                              key={course.crn}
                              className="flex items-center justify-between gap-2 p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-md"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#1e293b] break-words whitespace-normal">
                                  {course.name}
                                </p>
                                <p className="text-xs text-[#64748b] break-words whitespace-normal">
                                  {course.courseCode} · {course.credits} cr · {course.meetingDays} {course.meetingTime}
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveCourse(course)}
                                className="flex-shrink-0 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Weekly schedule */}
                    <div style={{ minHeight: "720px" }}>
                      <WeeklySchedule registered={courses} conflicts={conflicts} />
                    </div>
                  </div>
                </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminPage;
