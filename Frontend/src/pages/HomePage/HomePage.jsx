import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseSearch from "../../components/CourseSearch/CourseSearch";
import WeeklySchedule from "../../components/WeeklySchedule/WeeklySchedule";
import MySchedule from "../../components/MySchedule/MySchedule";
import { detectConflicts } from "../../utils/courseUtils";
import wayneLogo from "../../assets/images/wayneLogo.png";

function HomePage() {
  const [registered, setRegistered] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const conflicts = useMemo(() => detectConflicts(registered), [registered]);

  const handleAddCourse = (course) => {
    setRegistered((prev) => [...prev, course]);
  };

  const handleRemoveCourse = (course) => {
    setRegistered((prev) => prev.filter((c) => c.crn !== course.crn));
  };

  const handleSavePlan = async () => {
    if (registered.length === 0) return;

    const userId = localStorage.getItem("userId");
    const termId = registered[0].termId;
    const courseIds = registered.map((c) => c.courseId);

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/plans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_ids: courseIds,
          user: userId,
          term: termId,
          name: "My Plan",
        }),
      });

      if (!res.ok) throw new Error("Server error");

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f4f3] flex flex-col">
      <header className="sticky top-0 z-10 bg-[#0F3B2E] border-b border-[#0a2a20] shadow-md">
        <div className="flex items-center gap-3 px-[5%] h-[64px]">
          <img
            src={wayneLogo}
            alt="Wayne State University Logo"
            className="h-8 w-auto flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-[#a7d9cc] text-xs font-medium tracking-wide leading-none">
              WAYNE STATE UNIVERSITY
            </p>
            <h1 className="text-white text-base sm:text-lg font-semibold leading-tight">
              Course Registration
            </h1>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a5c45] hover:bg-[#226b52] transition border border-[#2d7a5f]"
              aria-label="User menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-white"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 w-36 bg-white border border-[#e2e8f0] rounded-lg shadow-lg overflow-hidden z-20">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            )}
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
            conflicts={conflicts}
          />
        </div>

        {/* Right: My Schedule + Weekly Schedule */}
        <div
          className="flex-1 sticky top-[calc(64px+1.5rem)] self-start flex flex-col gap-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px - 3rem)" }}
        >
          <MySchedule
            courses={registered}
            onRemove={(crn) => handleRemoveCourse({ crn })}
            totalCredits={registered.reduce((sum, c) => sum + (c.credits || 0), 0)}
            onSave={handleSavePlan}
            saveStatus={saveStatus}
          />
          <div className="flex-1 min-h-0">
            <WeeklySchedule registered={registered} conflicts={conflicts} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
