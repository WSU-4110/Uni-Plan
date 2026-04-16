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

function getQuickPlannerStateStorageKey(user) {
  return `quickPlannerState_${user}`;
}

const TERM_ID_TO_LABEL = {
  "202601": "Spring/Summer 2026",
  "202609": "Fall 2026",
};

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
  const [savedQuickPlannerState, setSavedQuickPlannerState] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStatus, setRegisterStatus] = useState("");
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingPlanName, setLoadingPlanName] = useState(null);

  const menuRef = useRef(null);
  const savePlanModalRef = useRef(null);
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
    try {
      const raw = localStorage.getItem(getQuickPlannerStateStorageKey(username));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setSavedQuickPlannerState(parsed);
        }
      }
    } catch {
      /* ignore corrupt data */
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const autoLoad = async () => {
      try {
        const res = await fetch(`/api/plans/registered?user=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          const loaded = (data.results ?? []).map(normalizeCourse);
          if (loaded.length > 0) {
            setRegistered(loaded);
          }
        }
      } catch { /* ignore */ }
    };
    autoLoad();
  }, [username]);

  const conflicts = useMemo(() => detectConflicts(registered), [registered]);

  const scheduleTerm = useMemo(() => {
    if (registered.length === 0) return "";
    const terms = new Set(registered.map((c) => c.term).filter(Boolean));
    if (terms.size === 1) {
      const termId = [...terms][0];
      return TERM_ID_TO_LABEL[termId] || "";
    }
    return "";
  }, [registered]);

  const hasMixedTerms = useMemo(() => {
    if (registered.length <= 1) return false;
    const terms = new Set(registered.map((c) => c.term).filter(Boolean));
    return terms.size > 1;
  }, [registered]);

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
    } catch (err) {
      setPlanStatus(err.message || "Failed to save plan.");
    } finally {
      setPlanLoading(false);
    }
  };


  const openLoadModal = async () => {
    setShowLoadModal(true);
    setLoadingPlans(true);
    try {
      const res = await fetch(`/api/plans/list?user=${encodeURIComponent(username)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSavedPlans(data.plans ?? []);
    } catch {
      setSavedPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleLoadPlan = async (plan) => {
    setLoadingPlanName(plan.name);
    try {
      const params = new URLSearchParams({
        user: username,
        term: String(plan.termId),
        name: plan.name,
      });
      const res = await fetch(`/api/plans/load?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const loaded = (data.results ?? []).map(normalizeCourse);
      if (loaded.length > 0) {
        setRegistered(loaded);
      }
      setShowLoadModal(false);
    } catch { /* ignore */ }
    finally {
      setLoadingPlanName(null);
    }
  };

  const handleRegister = async () => {
    if (registered.length === 0) return;
    setRegisterLoading(true);
    setRegisterStatus("");
    try {
      const courseIds = registered.map((c) => c.courseId).filter(Boolean);
      const res = await fetch("/api/plans/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: username, course_ids: courseIds }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setRegisterStatus("registered");
      setTimeout(() => setRegisterStatus(""), 3000);
    } catch {
      setRegisterStatus("error");
      setTimeout(() => setRegisterStatus(""), 3000);
    } finally {
      setRegisterLoading(false);
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

  const handleSaveQuickPlannerState = (state) => {
    setSavedQuickPlannerState(state);
    try {
      localStorage.setItem(
        getQuickPlannerStateStorageKey(username),
        JSON.stringify(state)
      );
    } catch {
      /* storage full — silent fail */
    }
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

  useEffect(() => {
    if (!showPlanModal) return;

    const modalEl = savePlanModalRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = modalEl ? Array.from(modalEl.querySelectorAll(focusableSelector)) : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    (first || modalEl)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowPlanModal(false);
        return;
      }
      if (e.key === "Tab" && first && last) {
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showPlanModal]);

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
            </button>
            <button
              onClick={openLoadModal}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#475569] border border-[#64748b] rounded-md hover:bg-[#334155] transition"
            >
              Load Plan
            </button>
            <button
              onClick={openSavePlan}
              className="px-3 py-1.5 text-xs font-medium text-white bg-[#1a5c45] border border-[#2d7a5f] rounded-md hover:bg-[#226b52] transition"
            >
              Save Plan
            </button>
            <button
              onClick={handleRegister}
              disabled={registerLoading || registered.length === 0 || hasMixedTerms}
              title={hasMixedTerms ? "Cannot register courses from different semesters" : ""}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition border ${
                registerStatus === "registered"
                  ? "bg-green-600 border-green-500 text-white"
                  : registerStatus === "error"
                  ? "bg-red-600 border-red-500 text-white"
                  : hasMixedTerms
                  ? "bg-gray-400 border-gray-300 text-white cursor-not-allowed"
                  : "bg-[#b45309] border-[#d97706] text-white hover:bg-[#92400e] disabled:opacity-40"
              }`}
            >
              {registerLoading
                ? "Registering…"
                : registerStatus === "registered"
                ? "Registered!"
                : registerStatus === "error"
                ? "Failed"
                : hasMixedTerms
                ? "Mixed Terms"
                : "Register"}
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
          <div
            ref={savePlanModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-plan-title"
            tabIndex={-1}
            className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4"
          >
            <h2 id="save-plan-title" className="text-base font-semibold text-[#1e293b] mb-4">
              Save Plan
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="save-plan-name" className="block text-xs font-medium text-[#64748b] mb-1">Plan Name</label>
                <input
                  id="save-plan-name"
                  type="text"
                  placeholder="e.g. My Fall Schedule"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10 transition"
                />
              </div>

              <div>
                <label htmlFor="save-plan-term-id" className="block text-xs font-medium text-[#64748b] mb-1">Term ID</label>
                <input
                  id="save-plan-term-id"
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

      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLoadModal(false)} />
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[70vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1e293b]">Load Plan</h2>
              <button
                onClick={() => setShowLoadModal(false)}
                className="text-[#94a3b8] hover:text-[#475569] transition text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {loadingPlans ? (
              <p className="text-sm text-[#64748b] text-center py-8">Loading plans…</p>
            ) : savedPlans.length === 0 ? (
              <p className="text-sm text-[#94a3b8] text-center py-8">No saved plans found.</p>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto">
                {savedPlans.map((p, i) => (
                  <button
                    key={`${p.name}-${p.termId}-${i}`}
                    onClick={() => handleLoadPlan(p)}
                    disabled={loadingPlanName === p.name}
                    className="text-left px-4 py-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#0F3B2E] hover:bg-[#f0fdf4] transition disabled:opacity-50"
                  >
                    <span className="text-sm font-semibold text-[#1e293b]">{p.name}</span>
                    <span className="ml-2 text-xs text-[#64748b]">
                      Term {p.termId} · {p.courseCount} course{p.courseCount !== 1 ? "s" : ""}
                    </span>
                    {loadingPlanName === p.name && (
                      <span className="ml-2 text-xs text-[#0F3B2E]">Loading…</span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
            scheduleTerm={scheduleTerm}
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
          savedPlannerState={savedQuickPlannerState}
          onSavePlannerState={handleSaveQuickPlannerState}
        />
      )}

    </div>
  );
}

export default HomePage;
