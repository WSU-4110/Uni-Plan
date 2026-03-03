export default function CourseRequirements({ course }) {
  return (
    <>
      <p className="mb-1"><strong>Corequisites:</strong> {course.corequisites}</p>
      <p><strong>Prerequisites:</strong> {course.prerequisites}</p>
    </>
  );
}
