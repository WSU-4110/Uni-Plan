const DAYS = ["M", "T", "W", "R", "F"];
const DAY_LABELS = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 56;

const COURSE_COLORS = [
  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  { bg: "#ede9fe", border: "#8b5cf6", text: "#4c1d95" },
  { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
];

function parseTimeToMinutes(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getDurationMin(meetingDays) {
  const dayCount = meetingDays.replace(/[^MTWRF]/g, "").length;
  return dayCount >= 3 ? 50 : 75;
}

function formatHour(h) {
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

export default function WeeklySchedule({ courses }) {
  const totalHours = END_HOUR - START_HOUR;
  const gridHeight = totalHours * HOUR_HEIGHT;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-4">
      <h2 className="text-base font-semibold text-[#1e293b] mb-3">
        Weekly Schedule
      </h2>

      {courses.length === 0 ? (
        <p className="text-sm text-[#94a3b8] text-center py-8">
          Add courses to see your weekly schedule.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div style={{ minWidth: 340 }}>
            <div className="flex mb-1">
              <div className="w-10 flex-shrink-0" />
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex-1 text-center text-[11px] font-semibold text-[#475569]"
                >
                  {DAY_LABELS[day]}
                </div>
              ))}
            </div>

            <div className="flex border-t border-[#e2e8f0]">
              <div
                className="w-10 flex-shrink-0 relative"
                style={{ height: gridHeight }}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ top: (h - START_HOUR) * HOUR_HEIGHT - 6 }}
                    className="absolute right-1 text-[9px] text-[#94a3b8] leading-none"
                  >
                    {formatHour(h)}
                  </div>
                ))}
              </div>

              {DAYS.map((day) => (
                <div
                  key={day}
                  className="flex-1 relative border-l border-[#e2e8f0]"
                  style={{ height: gridHeight }}
                >
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                      className="absolute left-0 right-0 border-t border-[#f1f5f9]"
                    />
                  ))}

                  {courses.map((course, idx) => {
                    if (!course.meetingDays.includes(day)) return null;
                    const startMin = parseTimeToMinutes(course.meetingTime);
                    const duration = getDurationMin(course.meetingDays);
                    const top =
                      (startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60);
                    const height = Math.max(
                      duration * (HOUR_HEIGHT / 60),
                      20
                    );
                    const color = COURSE_COLORS[idx % COURSE_COLORS.length];

                    return (
                      <div
                        key={course.crn}
                        style={{
                          position: "absolute",
                          top: `${top}px`,
                          height: `${height}px`,
                          left: "2px",
                          right: "2px",
                          backgroundColor: color.bg,
                          borderLeft: `3px solid ${color.border}`,
                        }}
                        className="rounded px-1 py-0.5 overflow-hidden"
                      >
                        <p
                          className="text-[10px] font-bold leading-tight truncate"
                          style={{ color: color.text }}
                        >
                          {course.courseCode}
                        </p>
                        <p
                          className="text-[9px] leading-tight truncate"
                          style={{ color: color.text }}
                        >
                          {course.meetingTime}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
