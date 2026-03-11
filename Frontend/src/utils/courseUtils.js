const DAY_CHAR_TO_LABEL = {
  M: "Mon",
  T: "Tue",
  W: "Wed",
  R: "Thu",
  F: "Fri",
};

/**
 * Parse meeting days string (e.g. "MWF", "TR") → array of day labels
 * e.g. "MWF" → ["Mon", "Wed", "Fri"]
 */
export function parseMeetingDays(meetingDaysStr) {
  if (!meetingDaysStr) return [];
  return meetingDaysStr
    .split("")
    .map((ch) => DAY_CHAR_TO_LABEL[ch])
    .filter(Boolean);
}

/**
 * Convert 12h time string to 24h "HH:MM" format
 * e.g. "10:00 AM" → "10:00", "2:00 PM" → "14:00"
 */
export function parseTo24h(timeStr) {
  if (!timeStr) return "08:00";
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

/**
 * Add minutes to a "HH:MM" time string → "HH:MM"
 */
export function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * Estimate class duration in minutes based on days-per-week
 * 3 meetings/week → 50 min, 2 meetings/week → 75 min, 1 meeting/week → 150 min
 */
export function estimateDuration(meetingDaysStr) {
  const count = parseMeetingDays(meetingDaysStr).length;
  if (count >= 3) return 50;
  if (count === 2) return 75;
  return 150;
}

/**
 * Convert time string "HH:MM" to float (e.g. "11:30" → 11.5)
 */
export function timeToFloat(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

/**
 * Returns true if two courses overlap on at least one shared day and their time ranges intersect.
 */
export function coursesOverlap(a, b) {
  const daysA = parseMeetingDays(a.meetingDays);
  const daysB = parseMeetingDays(b.meetingDays);
  const sharedDays = daysA.filter((d) => daysB.includes(d));
  if (sharedDays.length === 0) return false;

  const startA = timeToFloat(parseTo24h(a.meetingTime));
  const endA = startA + estimateDuration(a.meetingDays) / 60;
  const startB = timeToFloat(parseTo24h(b.meetingTime));
  const endB = startB + estimateDuration(b.meetingDays) / 60;

  return startA < endB && startB < endA;
}

/**
 * Returns a Set of CRNs that are involved in at least one time conflict.
 */
export function detectConflicts(courses) {
  const conflictingCrns = new Set();
  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      if (coursesOverlap(courses[i], courses[j])) {
        conflictingCrns.add(courses[i].crn);
        conflictingCrns.add(courses[j].crn);
      }
    }
  }
  return conflictingCrns;
}

/**
 * Returns registered courses that conflict with the given candidate course.
 */
export function findConflictingCourses(candidate, registered) {
  return registered.filter((c) => coursesOverlap(candidate, c));
}
