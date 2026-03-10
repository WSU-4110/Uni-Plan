import { useState } from "react";
import CourseSearch from "../../components/CourseSearch/CourseSearch";
import WeeklySchedule from "../../components/WeeklySchedule/WeeklySchedule";
import wayneLogo from "../../assets/images/wayneLogo.png";

function HomePage() {
  const [registered, setRegistered] = useState([]);

  const handleAddCourse = (course) => {
    setRegistered((prev) => [...prev, course]);
  };

  const handleRemoveCourse = (course) => {
    setRegistered((prev) => prev.filter((c) => c.crn !== course.crn));
  };

  return (
    <div className="min-h-screen bg-[#f0f4f3] flex flex-col">
      <header className="sticky top-0 z-10 bg-[#0F3B2E] border-b border-[#0a2a20] shadow-md">
        <div className="flex items-center gap-3 px-[5%] h-[64px]">
          <img
            src={wayneLogo}
            alt="Wayne State University Logo"
            className="h-8 w-auto flex-shrink-0"
          />
          <div>
            <p className="text-[#a7d9cc] text-xs font-medium tracking-wide leading-none">
              WAYNE STATE UNIVERSITY
            </p>
            <h1 className="text-white text-base sm:text-lg font-semibold leading-tight">
              Course Registration
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-4 px-4 sm:px-6 lg:px-8 py-6 min-h-0">
        {/* Left: Search section — 55% */}
        <div className="w-[55%] flex-shrink-0 overflow-y-auto">
          <CourseSearch
            registered={registered}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
          />
        </div>

        {/* Right: Weekly Schedule — 45%, sticky */}
        <div className="flex-1 sticky top-[calc(64px+1.5rem)] self-start" style={{ height: "calc(100vh - 64px - 3rem)" }}>
          <WeeklySchedule registered={registered} />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
