export default function CourseDetails({ course, onClose }) {
    if (!course) return null;
    return (
        <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full relative mx-auto"
            style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
        >
            <button
                onClick={onClose}
                aria-label="Close course details"
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl leading-none"
            >
                ×
            </button>

            <h1 className="text-xl font-semibold mb-2">{course.name}</h1>

            <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p><strong>Term:</strong> {course.term}</p>
                <p><strong>CRN:</strong> {course.crn}</p>
                <p><strong>Section:</strong> {course.section}</p>
                <p><strong>Course:</strong> {course.courseCode}</p>
                <p><strong>Credits:</strong> {course.credits}</p>
            </div>

            <p className="mb-2"><strong>Subject:</strong> {course.subject}</p>

            <p className="mb-3"><strong>Description:</strong> {course.description}</p>

            <p className="mb-3"><strong>Instructor / Meeting Times:</strong><br />
                Instructor: {course.instructor}<br />
                {course.meetingDays} {course.meetingTime}<br />
                 Main Campus | {course.building} | Room {course.room}
            </p>

            <p className="mb-1"><strong>Corequisites:</strong> {course.corequisites}</p>
            <p><strong>Prerequisites:</strong> {course.prerequisites}</p>

            <p className="mt-4 text-sm text-gray-500">Schedule Type: Lecture - traditional face-to-face</p>
        </div>
    );
}