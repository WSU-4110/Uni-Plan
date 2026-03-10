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

export default function WeeklySchedule({ registered }) {
  const timeLabels = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    timeLabels.push(`${display}:00 ${period}`);
  }

  const getCourseBlocks = (day) => {
    return registered
      .filter((course) => {
        const days = parseMeetingDays(course.meetingDays);
        return days.includes(day);
      })
      .map((course) => {
        const start24 = parseTo24h(course.meetingTime);
        const duration = estimateDuration(course.meetingDays);
        const end24 = addMinutes(start24, duration);

        const startFloat = timeToFloat(start24);
        const endFloat = timeToFloat(end24);
        const top = ((startFloat - START_HOUR) / HOURS_RANGE) * 100;
        const height = ((endFloat - startFloat) / HOURS_RANGE) * 100;

        const colorIndex = hashCrn(course.crn) % COLORS.length;
        const location = [course.building, course.room].filter(Boolean).join(" ");

        return {
          course,
          top,
          height,
          color: COLORS[colorIndex],
          start24,
          end24,
          location,
        };
      });
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between flex-shrink-0">
        <h2 className="text-base font-semibold text-[#1e293b]">Weekly Schedule</h2>
        {registered.length > 0 && (
          <span className="text-xs text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full">
            {registered.length} course{registered.length !== 1 ? "s" : ""}
          </span>
        )}
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
                className="flex items-start justify-end pr-2 text-[10px] text-[#94a3b8] border-b border-[#f1f5f9]"
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
                  {blocks.map(({ course, top, height, color, start24, end24, location }) => (
                    <div
                      key={course.crn}
                      className="absolute left-0.5 right-0.5 rounded overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] hover:z-10 hover:shadow-md"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(height, 4)}%`,
                        backgroundColor: color,
                      }}
                      title={`${course.courseCode} — ${course.name}\n${formatDisplayTime(start24)} – ${formatDisplayTime(end24)}${location ? `\n${location}` : ""}`}
                    >
                      <div className="p-1 text-white leading-tight">
                        <div className="text-[10px] font-semibold truncate">{course.courseCode}</div>
                        <div className="text-[9px] opacity-90 truncate">
                          {formatDisplayTime(start24)}
                        </div>
                        {location && (
                          <div className="text-[9px] opacity-80 truncate">{location}</div>
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
    </div>
  );
}
