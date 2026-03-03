import CourseInfo from "./CourseInfo";
import InstructorInfo from "./InstructorInfo";
import CourseRequirements from "./CourseRequirements";

export default function CourseDetails({ course, onClose }) {
  if (!course) return null;

  return (
    <div className="bg-white rounded-lg max-w-2xl w-full relative mx-auto overflow-hidden">
      <button onClick={onClose} className="absolute top-3 right-3 text-2xl">×</button>

      <div className="p-6 overflow-y-auto">
        <h1 className="text-xl font-semibold mb-2">{course.name}</h1>

        <CourseInfo course={course} />
        <p className="mb-3"><strong>Description:</strong> {course.description}</p>
        <InstructorInfo course={course} />
        <CourseRequirements course={course} />

        <p className="mt-4 text-sm text-gray-500">
          Schedule Type: Lecture - traditional face-to-face
        </p>
      </div>
    </div>
  );
}
