import React, { forwardRef } from "react";
import ExportButton from "../ExportButton/ExportButton";
import { parseMeetingDays, parseTo24h, addMinutes, estimateDuration, timeToFloat } from "../../utils/courseUtils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 20;
const HOURS_RANGE = END_HOUR - START_HOUR;

const COLORS = [
  "#006853", "#059669", "#10b981", "#0d9488",
  "#047857", "#065f46", "#14b8a6", "#0f766e",
  "#1d4ed8", "#7c3aed", "#b45309", "#be123c",
];

function hashCrn(crn) {
  let h = 0;
  for (let i = 0; i < crn.length; i++) h = (h * 31 + crn.charCodeAt(i)) >>> 0;
  return h;
}

function formatDisplayTime(time24) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
}

const WeeklySchedule = forwardRef(({ registered, conflicts = new Set() }, ref) => {
  const totalCredits = registered.reduce((sum, c) => sum + (c.credits || 0), 0);
  const conflictCount = conflicts.size;

  const timeLabels = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    timeLabels.push(`${display}:00 ${period}`);
  }

const getCourseBlocks = (day) => {
  return registered
    .filter((course) => {
      const parsed = parseMeetingDays(course.meetingDays || course.days || "");
      return parsed.includes(day);
    })
    .map((course) => {
      let startFloat;
      let endFloat;
      let start24;
      let end24;

      const startMin = Number(course.startMin);
      const endMin = Number(course.endMin);

      if (!Number.isNaN(startMin) && !Number.isNaN(endMin)) {
        startFloat = startMin / 60;
        endFloat = endMin / 60;

        start24 = `${String(Math.floor(startMin / 60)).padStart(2, "0")}:${String(startMin % 60).padStart(2, "0")}`;
        end24 = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`;
      } else {
        const timeStr = course.meetingTime || course.time || "";
        if (!timeStr || timeStr === "TBA") return null;

        const parts = timeStr.split(" - ");

        if (parts.length === 2) {
          start24 = parseTo24h(parts[0].trim());
          end24 = parseTo24h(parts[1].trim());

          startFloat = timeToFloat(start24);
          endFloat = timeToFloat(end24);
        } else {
          start24 = parseTo24h(timeStr);
          startFloat = timeToFloat(start24);

          if (Number.isNaN(startFloat)) return null;

          const durationHours =
            estimateDuration(course.meetingDays || course.days || "") / 60;

          endFloat = startFloat + durationHours;
          end24 = addMinutes(start24, durationHours * 60);
        }
      }

      if (
        Number.isNaN(startFloat) ||
        Number.isNaN(endFloat) ||
        endFloat <= startFloat
      ) {
        return null;
      }

      const top = ((startFloat - START_HOUR) / HOURS_RANGE) * 100;
      const height = ((endFloat - startFloat) / HOURS_RANGE) * 100;

      const colorIndex = hashCrn(String(course.crn || course.courseCode || course.name)) % COLORS.length;
      const location = [course.building, course.room].filter(Boolean).join(" ");
      const isConflict = conflicts.has(course.crn);

      return {
        course,
        top,
        height,
        color: isConflict ? "#dc2626" : COLORS[colorIndex],
        start24,
        end24,
        location,
        isConflict,
      };
    })
    .filter(Boolean);
};

  return (
    <div ref={ref} className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between flex-shrink-0">
        <h2 className="text-base font-semibold text-[#1e293b]">Weekly Schedule</h2>
        <div className="flex items-center gap-3">
          {registered.length > 0 && (
            <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
              {registered.length} course{registered.length !== 1 ? "s" : ""}
            </span>
          )}
          {registered.length > 0 && (
            <ExportButton registered={registered} conflicts={conflicts} />
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-0" style={{ minHeight: "600px" }}>
          {/* Time column */}
          <div className="flex-shrink-0 w-16">
            <div className="h-9 border-b-2 border-[#e2e8f0]" />
            {timeLabels.map((label, i) => (
              <div
                key={i}
                className="flex items-start justify-end pr-2 text-[10px] text-[#64748B] border-b border-[#f1f5f9]"
                style={{ height: "52px" }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((day) => {
            const blocks = getCourseBlocks(day);
            return (
              <div key={day} className="flex-1 flex flex-col border-l border-[#e2e8f0] min-w-0">
                {/* Day header */}
                <div className="h-9 flex items-center justify-center text-xs font-semibold text-[#1e293b] bg-[#f8fafc] border-b-2 border-[#e2e8f0] flex-shrink-0">
                  {day}
                </div>

                {/* Time slots */}
                <div className="relative flex-1">
                  {/* Hour grid lines */}
                  {timeLabels.map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-[#f1f5f9]"
                      style={{ height: "52px" }}
                    />
                  ))}

                  {/* Course blocks */}
                  {blocks.map(({ course, top, height, color, start24, end24, location, isConflict }) => (
                    <div
                      key={course.crn}
                      className="absolute left-0.5 right-0.5 rounded overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:z-10 hover:shadow-md"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(height, 4)}%`,
                        backgroundColor: color,
                        outline: isConflict ? "2px solid #fca5a5" : "none",
                      }}
                      title={`${isConflict ? "⚠ TIME CONFLICT\n" : ""}${course.courseCode} — ${course.name}\n${formatDisplayTime(start24)} – ${formatDisplayTime(end24)}${location ? `\n${location}` : ""}`}
                    >
                      <div className="p-1 text-white leading-tight break-words whitespace-normal">
                        <div className="text-[10px] font-semibold flex flex-wrap items-center gap-0.5 break-words whitespace-normal">
                          {isConflict && <span>⚠</span>}
                          {course.courseCode}
                        </div>
                        <div className="text-[9px] opacity-90 break-words whitespace-normal">
                          {formatDisplayTime(start24)}
                        </div>
                        {location && (
                          <div className="text-[9px] opacity-80 break-words whitespace-normal">{location}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conflict banner */}
      {conflictCount > 0 && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2 flex-shrink-0">
          <span className="text-red-600 text-sm">⚠</span>
          <span className="text-xs font-medium text-red-700">
            {conflictCount} course{conflictCount !== 1 ? "s" : ""} have time conflicts. Resolve before finalizing.
          </span>
        </div>
      )}

      {/* Footer: total credits */}
      <div className="px-4 py-2.5 border-t border-[#e2e8f0] flex items-center justify-between flex-shrink-0 bg-[#f8fafc]">
        <span className="text-xs text-[#64748b]">Total Credits</span>
        <span className={`text-sm font-semibold ${totalCredits > 18 ? "text-red-600" : "text-[#0F3B2E]"}`}>
          {totalCredits} / 18
        </span>
      </div>
    </div>
  );
});

export default WeeklySchedule;