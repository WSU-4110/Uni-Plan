export default function MySchedule({ registeredCourses, onRemove }) {
  const totalCredits = registeredCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm">
      <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1e293b]">My Schedule</h3>
        <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
          <span>{registeredCourses.length} {registeredCourses.length === 1 ? "course" : "courses"}</span>
          <span className="text-[#cbd5e1]">•</span>
          <span className={totalCredits > 16 ? "text-amber-600 font-medium" : ""}>
            {totalCredits} / 18 cr
          </span>
        </div>
      </div>

      <div className="p-4">
        {registeredCourses.length === 0 ? (
          <div className="text-center py-8 text-[#94a3b8]">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm font-medium">No courses added yet</p>
            <p className="text-xs mt-1">Search and add courses to build your schedule.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {registeredCourses.map((course) => (
              <li
                key={course.crn}
                className="flex items-start justify-between gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]"
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-[#0F3B2E] bg-[#d1fae5] px-2 py-0.5 rounded shrink-0">
                      {course.courseCode}
                    </span>
                    <span className="text-xs text-[#64748b] shrink-0">{course.credits} cr</span>
                  </div>
                  <p className="text-sm font-medium text-[#1e293b] truncate">{course.name}</p>
                  <p className="text-xs text-[#64748b]">
                    {course.meetingDays} · {course.meetingTime}–{course.meetingEndTime}
                  </p>
                  <p className="text-xs text-[#94a3b8]">👤 {course.instructor}</p>
                </div>
                <button
                  onClick={() => onRemove(course.crn)}
                  aria-label={`Remove ${course.courseCode}`}
                  className="shrink-0 mt-0.5 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {totalCredits > 0 && (
          <div className="mt-3 pt-3 border-t border-[#e2e8f0] flex justify-between text-xs text-[#64748b]">
            <span>Total Credits</span>
            <span className={`font-semibold ${totalCredits > 18 ? "text-red-600" : "text-[#0F3B2E]"}`}>
              {totalCredits} / 18
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
