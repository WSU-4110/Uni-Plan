import { useMemo } from "react";

const SCHEDULE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_CHAR_MAP = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };
const START_HOUR = 8;
const END_HOUR = 21;
const HOURS_COUNT = END_HOUR - START_HOUR;
const HOUR_HEIGHT_PX = 56;

const COURSE_COLORS = [
  "#0F3B2E",
  "#059669",
  "#0d9488",
  "#047857",
  "#065f46",
  "#0f766e",
  "#10b981",
  "#006853",
];

function timeToFloat(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(" ");
  if (parts.length < 2) return 0;
  const [time, period] = parts;
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

function parseDays(meetingDays) {
  return [...(meetingDays || "")].map((ch) => DAY_CHAR_MAP[ch]).filter(Boolean);
}

function formatHour(hour) {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:00 ${period}`;
}

export default function WeeklySchedule({ registeredCourses }) {
  const totalHeight = HOURS_COUNT * HOUR_HEIGHT_PX;

  const hours = useMemo(() => {
    return Array.from({ length: HOURS_COUNT + 1 }, (_, i) => formatHour(START_HOUR + i));
  }, []);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-[#e2e8f0]">
        <h3 className="text-sm font-semibold text-[#1e293b]">Weekly Schedule</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[560px]">
          {/* Time labels column */}
          <div className="w-16 flex-shrink-0 border-r border-[#e2e8f0]">
            <div className="h-9 border-b border-[#e2e8f0]" />
            <div className="relative" style={{ height: totalHeight }}>
              {hours.map((label, i) => (
                <div
                  key={label}
                  className="absolute right-2 text-[10px] text-[#94a3b8] -translate-y-1/2 whitespace-nowrap"
                  style={{ top: `${(i / HOURS_COUNT) * 100}%` }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Day columns */}
          {SCHEDULE_DAYS.map((day) => (
            <div key={day} className="flex-1 border-r border-[#e2e8f0] last:border-r-0">
              <div className="h-9 flex items-center justify-center border-b border-[#e2e8f0] bg-[#f8fafc]">
                <span className="text-xs font-semibold text-[#475569]">{day}</span>
              </div>

              <div className="relative" style={{ height: totalHeight }}>
                {/* Hour grid lines */}
                {Array.from({ length: HOURS_COUNT + 1 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-0 right-0 border-t border-[#f1f5f9]"
                    style={{ top: `${(i / HOURS_COUNT) * 100}%` }}
                  />
                ))}

                {/* Course blocks */}
                {registeredCourses
                  .filter((course) => parseDays(course.meetingDays).includes(day))
                  .map((course) => {
                    const startFloat = timeToFloat(course.meetingTime);
                    const endFloat = timeToFloat(course.meetingEndTime);
                    const top = ((startFloat - START_HOUR) / HOURS_COUNT) * 100;
                    const height = ((endFloat - startFloat) / HOURS_COUNT) * 100;
                    const colorIndex = parseInt(course.crn, 10) % COURSE_COLORS.length;

                    return (
                      <div
                        key={course.crn}
                        className="absolute left-0.5 right-0.5 rounded overflow-hidden px-1.5 py-1 text-white"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                          backgroundColor: COURSE_COLORS[colorIndex],
                          minHeight: "24px",
                        }}
                        title={`${course.courseCode} — ${course.name}\n${course.meetingTime}–${course.meetingEndTime}`}
                      >
                        <div className="text-[10px] font-bold leading-tight truncate">
                          {course.courseCode}
                        </div>
                        <div className="text-[9px] leading-tight opacity-80 truncate">
                          {course.meetingTime}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
