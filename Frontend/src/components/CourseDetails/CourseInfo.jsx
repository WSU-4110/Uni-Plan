export default function CourseInfo({ course }) {
  return (
    <div className="text-sm text-gray-600 mb-4 space-y-1">
      <p><strong>Term:</strong> {course.term}</p>
      <p><strong>CRN:</strong> {course.crn}</p>
      <p><strong>Section:</strong> {course.section}</p>
      <p><strong>Course:</strong> {course.courseCode}</p>
      <p><strong>Credits:</strong> {course.credits}</p>
    </div>
  );
}
