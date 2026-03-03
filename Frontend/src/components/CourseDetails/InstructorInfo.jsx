export default function InstructorInfo({ course }) {
  return (
    <p className="mb-3">
      <strong>Instructor / Meeting Times:</strong><br />
      Instructor: {course.instructor}<br />
      {course.meetingDays} {course.meetingTime}<br />
      Main Campus | {course.building} | Room {course.room}
    </p>
  );
}
