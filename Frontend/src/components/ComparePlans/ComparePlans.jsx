import {
  parseMeetingDays,
  parseTo24h,
  addMinutes,
  estimateDuration,
  timeToFloat,
  formatMeetingDaysForDisplay,
} from "../../utils/courseUtils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const START_HOUR = 8;
const END_HOUR = 20;
const HOURS_RANGE = END_HOUR - START_HOUR;

const COLORS = [
  "#006853",
  "#059669",
  "#10b981",
  "#0d9488",
  "#047857",
  "#065f46",
  "#14b8a6",
  "#0f766e",
  "#1d4ed8",
  "#7c3aed",
];

function hashCrn(crn) {
  const s = String(crn ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function formatDisplayTime(time24) {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${period}`;
}

const SLOT_PX = 28;

function MiniWeekGrid({ plan, accentClass }) {
  const timeLabels = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    timeLabels.push(`${display}:00 ${period}`);
  }

  const getCourseBlocks = (day) => {
    return plan
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
        return {
          course,
          top,
          height,
          color: COLORS[colorIndex],
          start24,
        };
      });
  };

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden bg-white ${accentClass}`}
    >
      <div className="flex min-w-0" style={{ minHeight: `${9 + timeLabels.length * SLOT_PX}px` }}>
        <div className="flex-shrink-0 w-[3.75rem] sm:w-14">
          <div className="h-7 border-b-2 border-[#cbd5e1] bg-[#f1f5f9]" />
          {timeLabels.map((label, i) => (
            <div
              key={i}
              className="flex items-start justify-end pr-1 text-[9px] sm:text-[10px] font-medium text-[#475569] border-b border-[#e2e8f0] leading-tight"
              style={{ height: `${SLOT_PX}px` }}
            >
              {label}
            </div>
          ))}
        </div>
        {DAYS.map((day) => {
          const blocks = getCourseBlocks(day);
          return (
            <div key={day} className="flex-1 flex flex-col border-l border-[#cbd5e1] min-w-0">
              <div className="h-7 flex items-center justify-center text-[11px] font-bold text-[#0f172a] bg-[#f8fafc] border-b-2 border-[#cbd5e1]">
                {day}
              </div>
              <div className="relative flex-1 bg-[#fafafa]">
                {timeLabels.map((_, i) => (
                  <div
                    key={i}
                    className="border-b border-[#e2e8f0]"
                    style={{ height: `${SLOT_PX}px` }}
                  />
                ))}
                {blocks.map(({ course, top, height, color, start24 }) => (
                  <div
                    key={`${course.crn}-${day}`}
                    className="absolute left-0.5 right-0.5 rounded shadow-sm border border-black/10"
                    style={{
                      top: `${top}%`,
                      height: `${Math.max(height, 5)}%`,
                      backgroundColor: color,
                    }}
                    title={`${course.courseCode} — ${formatDisplayTime(start24)}`}
                  >
                    <div className="px-0.5 py-0.5 text-white leading-tight">
                      <div className="text-[9px] font-bold truncate">{course.courseCode}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanColumn({
  title,
  planNumber,
  plan,
  onSelect,
  selectLabel,
  accentBorder,
  accentButton,
  columnClass = "",
}) {
  const credits = plan.reduce((s, c) => s + (c.credits || 0), 0);

  return (
    <div className={`flex flex-col min-w-0 gap-4 ${columnClass}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#cbd5e1] pb-3">
        <div>
          <h3 className="text-lg font-bold text-[#0f172a]">{title}</h3>
          <p className="text-sm font-medium text-[#475569] mt-0.5">
            Plan {planNumber} ·{" "}
            <span className="text-[#0F3B2E]">{credits} credits</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(plan)}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${accentButton}`}
        >
          {selectLabel}
        </button>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-[#64748b] mb-2">
          Courses
        </h4>
        <ul className="space-y-2 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] p-3 max-h-48 overflow-y-auto">
          {plan.map((c) => (
            <li
              key={c.crn}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm border-b border-[#e2e8f0] last:border-0 pb-2 last:pb-0"
            >
              <span className="font-bold text-[#0f172a]">{c.courseCode}</span>
              <span className="text-[#334155]">
                {formatMeetingDaysForDisplay(c.meetingDays)} {c.meetingTime}
              </span>
              {c.instructor && (
                <span className="text-xs text-[#64748b] w-full sm:w-auto truncate">
                  {c.instructor}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-bold uppercase tracking-wide text-[#64748b] mb-2">
          Weekly layout
        </h4>
        <MiniWeekGrid plan={plan} accentClass={accentBorder} />
      </div>
    </div>
  );
}

export default function ComparePlans({
  onClose,
  planA,
  planB,
  planNumberA,
  planNumberB,
  onSelectPlan,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto py-6 px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-[min(96rem,calc(100vw-2rem))] max-h-[min(92vh,900px)] flex flex-col border border-[#cbd5e1]"
        role="dialog"
        aria-labelledby="compare-plans-title"
      >
        <div className="flex items-center justify-between px-8 py-5 border-b-2 border-[#e2e8f0] bg-[#f8fafc] flex-shrink-0">
          <div>
            <h2 id="compare-plans-title" className="text-xl font-bold text-[#0f172a]">
              Compare plans
            </h2>
            <p className="text-sm text-[#64748b] mt-1">
              Review courses and weekly times side by side, then choose one to apply.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#e2e8f0] transition text-[#475569] text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
            <PlanColumn
              title="Plan A"
              planNumber={planNumberA}
              plan={planA}
              onSelect={onSelectPlan}
              selectLabel="Select plan A"
              accentBorder="border-[#0F3B2E]/40"
              accentButton="bg-[#0F3B2E] hover:bg-[#0a2a20] focus:ring-[#0F3B2E]"
              columnClass="lg:pr-10"
            />
            <PlanColumn
              title="Plan B"
              planNumber={planNumberB}
              plan={planB}
              onSelect={onSelectPlan}
              selectLabel="Select plan B"
              accentBorder="border-[#C5A334]/50"
              accentButton="bg-[#b8941f] hover:bg-[#a38219] focus:ring-[#C5A334]"
              columnClass="lg:border-l-2 lg:border-[#cbd5e1] lg:pl-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
