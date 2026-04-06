import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseSearch from "../../components/CourseSearch/CourseSearch";
import WeeklySchedule from "../../components/WeeklySchedule/WeeklySchedule";
import MySchedule from "../../components/MySchedule/MySchedule";
import QuickPlanner from "../../components/QuickPlanner/QuickPlanner";
import { detectConflicts } from "../../utils/courseUtils";
import wayneLogo from "../../assets/images/wayneLogo.png";

function getQuickPlanStorageKey(user) {
  return `quickPlans_${user}`;
}

function getLastPlanKey(user) {
  return `lastPlan_${user}`;
}

function normalizeCourse(raw) {
  return {
    ...raw,
    number: raw.courseNumber ?? raw.number ?? "",
    meetingDays: raw.days ?? raw.meetingDays ?? "TBA",
    meetingTime: raw.time ?? raw.meetingTime ?? "TBA",
  };
}

function HomePage() {
  const [registered, setRegistered] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planTermId, setPlanTermId] = useState("");
  const [planStatus, setPlanStatus] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [showQuickPlanner, setShowQuickPlanner] = useState(false);
  const [savedQuickPlans, setSavedQuickPlans] = useState([]);

  const menuRef = useRef(null);
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    if (localStorage.getItem("userRole") === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(getQuickPlanStorageKey(username));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedQuickPlans(parsed);
        }
      }
    } catch {
      /* ignore corrupt data */
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const autoLoad = async () => {
      // 1) Try loading from server using saved plan info
      try {
        const planInfo = localStorage.getItem(getLastPlanKey(username));
        if (planInfo) {
          const { name, term } = JSON.parse(planInfo);
          if (name && term) {
            const params = new URLSearchParams({ user: username, term, name });
            const res = await fetch(`/api/plans/load?${params}`);
            if (res.ok) {
              const data = await res.json();
              const loaded = (data.results ?? []).map(normalizeCourse);
              if (loaded.length > 0) {
                setRegistered(loaded);
                return;
              }
            }
          }
        }
      } catch { /* fall through to cache */ }

      // 2) Fallback: restore from localStorage cache
      try {
        const cached = localStorage.getItem(`schedule_${username}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegistered(parsed);
          }
        }
      } catch { /* ignore */ }
    };
    autoLoad();
  }, [username]);

  const conflicts = useMemo(() => detectConflicts(registered), [registered]);

  const handleAddCourse = (course) => {
    setRegistered((prev) => [...prev, course]);
  };

  const handleRemoveCourse = (course) => {
    setRegistered((prev) => prev.filter((c) => c.crn !== course.crn));
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  const openSavePlan = () => {
    setPlanStatus("");
    setShowPlanModal(true);
  };


  const handleSavePlan = async () => {
    if (!planName.trim()) { setPlanStatus("Please enter a plan name."); return; }
    if (!planTermId) { setPlanStatus("Please select a term."); return; }

    setPlanLoading(true);
    setPlanStatus("");
    try {
      const courseIds = registered.map((c) => c.courseId).filter(Boolean);
      const res = await fetch("/api/plans/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_ids: courseIds,
          user: username,
          term: parseInt(planTermId),
          name: planName.trim(),
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setPlanStatus("Plan saved successfully!");
      try {
        localStorage.setItem(
          getLastPlanKey(username),
          JSON.stringify({ name: planName.trim(), term: planTermId })
        );
        localStorage.setItem(
          `schedule_${username}`,
          JSON.stringify(registered)
        );
      } catch { /* ignore */ }
    } catch (err) {
      setPlanStatus(err.message || "Failed to save plan.");
    } finally {
      setPlanLoading(false);
    }
  };


  const handleSaveQuickPlans = (plans) => {
    setSavedQuickPlans(plans);
    try {
      localStorage.setItem(
        getQuickPlanStorageKey(username),
        JSON.stringify(plans)
      );
    } catch {
      /* storage full — silent fail */
    }
  };

  const handleApplyQuickPlan = (plan) => {
    setRegistered(plan);
    setShowQuickPlanner(false);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuickPlanner(true)}
              className="relative px-3 py-1.5 text-xs font-medium text-white bg-[#2563eb] border border-[#3b82f6] rounded-md hover:bg-[#1d4ed8] transition"
            >
              Quick Planner
              {savedQuickPlans.length > 0 && !showQuickPlanner && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-white" />
              )}
            </button>
            <button
              onClick={openSavePlan}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#1a5c45] border border-[#2d7a5f] rounded-md hover:bg-[#226b52] transition"
            >
              Save Plan
            </button>
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
              <div className="absolute right-0 top-11 w-44 bg-white border border-[#e2e8f0] rounded-lg shadow-lg overflow-hidden z-20">
                {username && (
                  <p className="px-4 py-2 text-xs text-[#64748b] border-b border-[#e2e8f0] truncate">{username}</p>
                )}
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

      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPlanModal(false)} />
          <div className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-base font-semibold text-[#1e293b] mb-4">
              Save Plan
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Fall Schedule"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#64748b] mb-1">Term ID</label>
                <input
                  type="text"
                  placeholder="e.g. 202609"
                  value={planTermId}
                  onChange={(e) => setPlanTermId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
                />
              </div>

              {planStatus && (
                <p className={`text-sm px-3 py-2 rounded ${planStatus.includes("success") || planStatus.startsWith("Loaded") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                  {planStatus}
                </p>
              )}

              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSavePlan}
                  disabled={planLoading}
                  className="flex-1 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] disabled:opacity-50 text-white text-sm font-medium rounded-md transition"
                >
                  {planLoading ? "Please wait…" : "Save"}
                </button>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-2 border border-[#e2e8f0] text-[#475569] text-sm font-medium rounded-md hover:bg-[#f8fafc] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex gap-4 px-4 sm:px-6 lg:px-8 py-6 min-h-0">
        <div className="w-[55%] flex-shrink-0 overflow-y-auto">
          <CourseSearch
            registered={registered}
            onAddCourse={handleAddCourse}
            onRemoveCourse={handleRemoveCourse}
            conflicts={conflicts}
          />
        </div>

        <div
          className="flex-1 sticky top-[calc(64px+1.5rem)] self-start flex flex-col gap-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 64px - 3rem)" }}
        >
          <MySchedule
            courses={registered}
            onRemove={(crn) => handleRemoveCourse({ crn })}
            totalCredits={registered.reduce((sum, c) => sum + (c.credits || 0), 0)}
          />
          <div className="flex-1 min-h-0">
            <WeeklySchedule registered={registered} conflicts={conflicts} />
          </div>
        </div>
      </main>

      {showQuickPlanner && (
        <QuickPlanner
          onClose={() => setShowQuickPlanner(false)}
          onApplyPlan={handleApplyQuickPlan}
          savedPlans={savedQuickPlans}
          onSavePlans={handleSaveQuickPlans}
        />
      )}
    </div>
  );
}

export default HomePage;
