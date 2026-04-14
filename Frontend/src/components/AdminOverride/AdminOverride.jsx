import { useState, useMemo } from "react";
import CourseSearch from "../CourseSearch/CourseSearch";
import WeeklySchedule from "../WeeklySchedule/WeeklySchedule";
import { detectConflicts } from "../../utils/courseUtils";

const TERM_OPTIONS = [
  { label: "Spring/Summer 2026", value: 202601 },
  { label: "Fall 2026", value: 202609 },
];

function normalizeCourse(raw) {
  return {
    ...raw,
    number: raw.courseNumber ?? raw.number ?? "",
    meetingDays: raw.days ?? raw.meetingDays ?? "TBA",
    meetingTime: raw.time ?? raw.meetingTime ?? "TBA",
  };
}

export default function AdminOverride({ onClose }) {
  const adminUser = localStorage.getItem("username") || "";

  const [studentId, setStudentId] = useState("");
  const [termId, setTermId] = useState("");
  const [planName, setPlanName] = useState("");

  const [courses, setCourses] = useState([]);
  const [loadStatus, setLoadStatus] = useState("");
  const [loadLoading, setLoadLoading] = useState(false);

  const [saveStatus, setSaveStatus] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [planLoaded, setPlanLoaded] = useState(false);

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const conflicts = useMemo(() => detectConflicts(courses), [courses]);

  const handleLoadPlan = async () => {
    if (!studentId.trim()) { setLoadStatus("Enter a Student ID."); return; }
    if (!termId) { setLoadStatus("Select a term."); return; }
    if (!planName.trim()) { setLoadStatus("Enter a plan name."); return; }

    setLoadLoading(true);
    setLoadStatus("");
    setSaveStatus("");
    try {
      const params = new URLSearchParams({
        admin_user: adminUser,
        student_id: studentId.trim(),
        term: termId,
        name: planName.trim(),
      });
      const res = await fetch(`/api/admin/plans/load?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      const loaded = (data.results ?? []).map(normalizeCourse);
      setCourses(loaded);
      setPlanLoaded(true);
      setLoadStatus(
        loaded.length > 0
          ? `Loaded ${loaded.length} course(s) for ${studentId.trim()}.`
          : `No saved plan found. You can add courses below.`
      );
    } catch (err) {
      setLoadStatus(err.message || "Failed to load plan.");
      setPlanLoaded(false);
    } finally {
      setLoadLoading(false);
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
    if (!studentId.trim() || !termId || !planName.trim()) {
      setSaveStatus("Student ID, term, and plan name are required.");
      return;
    }

    setSaveLoading(true);
    setSaveStatus("");
    try {
      const courseIds = courses.map((c) => c.courseId).filter(Boolean);
      const res = await fetch("/api/admin/plans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_user: adminUser,
          student_id: studentId.trim(),
          course_ids: courseIds,
          term: parseInt(termId),
          name: planName.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server error: ${res.status}`);
      }
      setSaveStatus("Plan saved successfully!");
    } catch (err) {
      setSaveStatus(err.message || "Failed to save plan.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f0f4f3]">
      {/* Header */}
      <header className="bg-[#7c2d12] border-b border-[#9a3412] shadow-md flex-shrink-0">
        <div className="flex items-center justify-between px-6 h-[56px]">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-semibold bg-red-600 px-2 py-0.5 rounded">
              ADMIN
            </span>
            <h1 className="text-white text-base font-semibold">
              Schedule Override
            </h1>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-white bg-white/20 border border-white/30 rounded-md hover:bg-white/30 transition"
          >
            Close
          </button>
        </div>
      </header>

      {/* Student lookup bar */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4 flex-shrink-0">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#64748b]">Student ID</label>
            <input
              type="text"
              placeholder="e.g. john_doe"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-44 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#7c2d12] focus:ring-2 focus:ring-[#7c2d12]/10 transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#64748b]">Term</label>
            <select
              value={termId}
              onChange={(e) => setTermId(e.target.value)}
              className="w-52 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#7c2d12] focus:ring-2 focus:ring-[#7c2d12]/10 transition"
            >
              <option value="">Select term</option>
              {TERM_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#64748b]">Plan Name</label>
            <input
              type="text"
              placeholder="e.g. Fall Plan"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-44 px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#7c2d12] focus:ring-2 focus:ring-[#7c2d12]/10 transition"
            />
          </div>
          <button
            onClick={handleLoadPlan}
            disabled={loadLoading}
            className="px-4 py-2 bg-[#7c2d12] hover:bg-[#6b2710] disabled:opacity-50 text-white text-sm font-medium rounded-md transition"
          >
            {loadLoading ? "Loading…" : "Load Plan"}
          </button>

          {loadStatus && (
            <p className={`text-sm px-3 py-2 rounded self-end ${
              loadStatus.startsWith("Loaded") || loadStatus.startsWith("No saved")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {loadStatus}
            </p>
          )}
        </div>
      </div>

      {/* Main content */}
      {planLoaded && (
        <main className="flex-1 flex gap-4 px-4 sm:px-6 py-4 min-h-0 overflow-hidden">
          {/* Left: Course search */}
          <div className="w-[55%] flex-shrink-0 overflow-y-auto">
            <CourseSearch
              registered={courses}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              conflicts={conflicts}
              bypassCreditLimit
            />
          </div>

          {/* Right: Student schedule + save */}
          <div
            className="flex-1 flex flex-col gap-4 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 56px - 80px - 2rem)" }}
          >
            {/* Schedule summary */}
            <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-[#1e293b]">
                  {studentId.trim()}'s Schedule
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      totalCredits > 18
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : "bg-[#d1fae5] text-[#065f46]"
                    }`}
                  >
                    {totalCredits} credits
                    {totalCredits > 18 && " (override)"}
                  </span>
                </div>
              </div>

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

              {/* Force save */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleForceSave}
                  disabled={saveLoading || courses.length === 0}
                  className="px-4 py-2 bg-[#7c2d12] hover:bg-[#6b2710] disabled:opacity-50 text-white text-sm font-medium rounded-md transition"
                >
                  {saveLoading ? "Saving…" : "Force Save"}
                </button>
                {totalCredits > 18 && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded">
                    Exceeds 18 credit limit — admin override active
                  </span>
                )}
                {saveStatus && (
                  <p className={`text-sm px-3 py-1.5 rounded ${
                    saveStatus.includes("success")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {saveStatus}
                  </p>
                )}
              </div>
            </div>

            {/* Weekly schedule view */}
            <div className="flex-1 min-h-0">
              <WeeklySchedule registered={courses} conflicts={conflicts} />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
