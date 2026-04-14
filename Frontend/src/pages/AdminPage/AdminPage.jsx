import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WeeklySchedule from "../../components/WeeklySchedule/WeeklySchedule";
import { detectConflicts } from "../../utils/courseUtils";
import wayneLogo from "../../assets/images/wayneLogo.png";

const TERM_OPTIONS = [
  { label: "Spring/Summer 2026", value: 202601 },
  { label: "Fall 2026", value: 202609 },
];

function normalizePlanCourse(c) {
  const timeRaw = c.time || "";
  let meetingTime = "TBA";
  if (timeRaw && timeRaw !== "TBA") {
    const first = timeRaw.split(" - ")[0]?.trim();
    if (first) meetingTime = first;
  }
  const loc = c.location;
  const building = loc && loc !== "TBA" ? loc : "";
  return {
    ...c,
    meetingDays: c.days || "TBA",
    meetingTime,
    building,
    room: "",
  };
}

function AdminPage() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "";

  const [studentId, setStudentId] = useState("");
  const [termId, setTermId] = useState(String(TERM_OPTIONS[0].value));
  const [planName, setPlanName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawResults, setRawResults] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }
    if (userRole !== "admin") {
      navigate("/home", { replace: true });
    }
  }, [isLoggedIn, userRole, navigate]);

  const registered = useMemo(() => {
    if (!rawResults) return [];
    return rawResults.map(normalizePlanCourse);
  }, [rawResults]);

  const conflicts = useMemo(
    () => detectConflicts(registered),
    [registered]
  );

  const totalCredits = useMemo(
    () => registered.reduce((s, c) => s + (c.credits || 0), 0),
    [registered]
  );

  const handleLoadSchedule = async (e) => {
    e.preventDefault();
    setLoadError("");
    const sid = studentId.trim();
    const pname = planName.trim();
    if (!sid || !pname) {
      setLoadError("Student ID and plan name are required.");
      return;
    }
    const term = Number(termId);
    if (!Number.isFinite(term)) {
      setLoadError("Select a valid term.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        admin_user: username,
        student_id: sid,
        term: String(term),
        name: pname,
      });
      const res = await fetch(`/api/admin/plans/load?${params}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((d) => d.msg || d).join(" ")
              : res.statusText;
        setRawResults(null);
        setLoadError(detail || "Could not load this plan.");
        return;
      }

      const list = data.results ?? [];
      setRawResults(list);
    } catch {
      setRawResults(null);
      setLoadError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    navigate("/login", { replace: true });
  };

  if (!isLoggedIn || userRole !== "admin") {
    return (
      <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center text-[#64748b] text-sm">
        Redirecting…
      </div>
    );
  }

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
              Admin Panel
            </h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#1a5c45] border border-[#2d7a5f] rounded-md hover:bg-[#226b52] transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-[5%] py-8 w-full max-w-6xl mx-auto">
        <p className="text-sm text-[#64748b] mb-6">
          Signed in as{" "}
          <span className="font-medium text-[#334155]">{username}</span>
        </p>

        <section className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-[#1e293b] mb-1">
            Look up a student schedule
          </h2>
          <p className="text-sm text-[#64748b] mb-5">
            Load the saved plan for a student by ID, term, and plan name (same
            fields as in the database).
          </p>

          <form
            onSubmit={handleLoadSchedule}
            className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
          >
            <div className="flex-1 min-w-[10rem]">
              <label htmlFor="admin-student-id" className="block text-xs font-medium text-[#64748b] mb-1">
                Student ID
              </label>
              <input
                id="admin-student-id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. student1"
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10"
                autoComplete="off"
              />
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="admin-term-id" className="block text-xs font-medium text-[#64748b] mb-1">
                Term
              </label>
              <select
                id="admin-term-id"
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] bg-white outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10"
              >
                {TERM_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[10rem]">
              <label htmlFor="admin-plan-name" className="block text-xs font-medium text-[#64748b] mb-1">
                Plan name
              </label>
              <input
                id="admin-plan-name"
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Saved plan name"
                className="w-full px-3 py-2 border border-[#e2e8f0] rounded-md text-sm text-[#334155] outline-none focus:border-[#0F3B2E] focus:ring-2 focus:ring-[#0F3B2E]/10"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0F3B2E] hover:bg-[#0a2a20] disabled:opacity-50 text-white text-sm font-semibold rounded-md transition w-full sm:w-auto"
            >
              {loading ? "Loading…" : "Load schedule"}
            </button>
          </form>

          {loadError && (
            <p className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {loadError}
            </p>
          )}
        </section>

        {rawResults !== null && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-[#1e293b]">
                Student schedule
              </h2>
              <p className="text-sm text-[#64748b]">
                <span className="font-medium text-[#334155]">
                  {studentId.trim()}
                </span>
                {" · "}
                {TERM_OPTIONS.find((t) => String(t.value) === termId)?.label ??
                  termId}
                {" · "}
                <span className="italic">{planName.trim()}</span>
                {" · "}
                <span className="text-[#0F3B2E] font-semibold">
                  {totalCredits} credits
                </span>
              </p>
            </div>

            {rawResults.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900">
                No courses in this plan, or the plan does not exist for this
                student and term.
              </div>
            ) : (
              <div className="flex flex-col gap-4 min-h-0">
                <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden min-h-[520px]">
                  <WeeklySchedule
                    registered={registered}
                    conflicts={conflicts}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mt-10 bg-white border border-dashed border-[#cbd5e1] rounded-lg p-6">
          <h2 className="text-base font-semibold text-[#1e293b] mb-2">
            Overrides
          </h2>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Time overlaps, credit limits, and enrollment caps will be handled
            here in a later update. This panel is read-only for now.
          </p>
        </section>
      </main>
    </div>
  );
}

export default AdminPage;
