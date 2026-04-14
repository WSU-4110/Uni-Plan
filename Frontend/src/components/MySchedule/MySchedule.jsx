import { forwardRef } from "react";

function MySchedule({ courses, onRemove, totalCredits }, ref) {
  return (
    <div ref={ref} className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[#1e293b]">My Schedule</h2>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${
            totalCredits >= 18
              ? "bg-red-100 text-red-700"
              : "bg-[#d1fae5] text-[#065f46]"
          }`}
        >
          {totalCredits} / 18 credits
        </span>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-[#94a3b8] text-center py-6">
          No courses added yet.
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
                onClick={() => onRemove(course.crn)}
                className="flex-shrink-0 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default forwardRef(MySchedule);
