import { useState } from "react";
import { useNavigate } from "react-router-dom";

import wayneLogo from "../../assets/images/wayneLogo.png";
import person from "../../assets/images/person.png";
import lock from "../../assets/images/lock.png";
import checkmark from "../../assets/images/checkmark.png";

function LoginPage() {
    const [loginMode, setLoginMode] = useState("student");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const switchMode = (mode) => {
        setLoginMode(mode);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        const normalizedUsername = username.trim();

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: normalizedUsername, password }),
            });

            const data = await res.json();

            if (data.success) {
                const role = data.role ?? "";
                if (loginMode === "admin" && role !== "admin") {
                    setError(
                        "Administrator access required. This account does not have admin privileges."
                    );
                    return;
                }
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", data.username ?? normalizedUsername);
                localStorage.setItem("userRole", role);
                if (role === "admin") {
                    navigate("/admin", { replace: true });
                } else {
                    navigate("/home", { replace: true });
                }
            } else {
                setError(data.message || "Invalid username or password");
            }
        } catch {
            setError("Unable to reach the server. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white">
            <header className="sticky top-0 w-full h-[77px] bg-[#0F3B2E] flex items-center px-[5%] z-10 gap-3">
                <img
                    src={wayneLogo}
                    alt="Wayne State University Logo"
                    className="h-[clamp(30px,5vw,40px)] w-auto flex-shrink-0"
                />
                <h1 className="text-white font-serif text-[clamp(14px,2.5vw,20px)] leading-tight">
                    WAYNE STATE UNIVERSITY
                </h1>
            </header>

            <main role="main">
                <div
                    className={`w-[95%] sm:max-w-[500px] mx-auto mt-6 bg-white border border-[#ddd] rounded-lg shadow-sm ${
                        loginMode === "admin" ? "border-l-4 border-l-[#b45309] border-[#ddd]" : ""
                    }`}
                >
                    <div className="flex flex-wrap items-baseline gap-2 pt-[27px] pl-[10px] pr-[10px]">
                        <h2 className="text-[#0F3B2E]">
                            {loginMode === "admin" ? "Administrator Login" : "Academica Login"}
                        </h2>
                        {loginMode === "admin" && (
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#b45309] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                Admin
                            </span>
                        )}
                    </div>

                    <p className="px-5 pt-3 pb-2 text-sm sm:text-base text-gray-700">
                        {loginMode === "admin" ? (
                            <>
                                Sign in with an <strong className="font-semibold text-gray-900">administrator</strong>{" "}
                                account to access admin tools. Uses the same server login as students; only accounts
                                with the admin role may complete this sign-in.
                            </>
                        ) : (
                            <>
                                You have reached a page that requires authentication,
                                please enter your Username and password.
                            </>
                        )}
                    </p>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <p className="mx-5 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        <div className="w-full mb-5 px-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                <img src={person} className="w-2.5 h-2.5" alt="User icon" />
                                <label className="block text-base font-semibold text-black">Your Username</label>
                            </div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoCapitalize="none"
                                autoComplete="username"
                                autoCorrect="off"
                                spellCheck={false}
                                className="w-full py-3.5 px-3 border border-[#ccc] rounded bg-[#e6f2ff] text-black outline-none focus:bg-[#e6f2ff]"
                            />
                        </div>

                        <div className="w-full mb-5 px-5">
                            <div className="flex items-center gap-2 mb-1.5">
                                <img src={lock} className="w-2.5 h-2.5" alt="Lock icon" />
                                <label className="block text-base font-semibold text-black">Your Password</label>
                            </div>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-3.5 px-3 border border-[#ccc] rounded bg-[#e6f2ff] text-black outline-none focus:bg-[#e6f2ff]"
                            />
                        </div>

                        <div className="w-full mb-5 px-5">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-[whitesmoke] text-[#0A6A19] border border-[darkgrey] px-5 py-2.5 rounded font-semibold cursor-pointer disabled:opacity-50"
                            >
                                <img src={checkmark} className="w-5 h-5" alt="Checkmark icon" />
                                {loading ? "Logging in..." : loginMode === "admin" ? "Admin login" : "Login"}
                            </button>
                        </div>
                    </form>

                    <div className="px-5 pb-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {loginMode === "student" ? (
                            <button
                                type="button"
                                onClick={() => switchMode("admin")}
                                className="text-[#0F3B2E] font-semibold underline underline-offset-2 hover:text-[#0a2a20]"
                            >
                                Administrator login
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => switchMode("student")}
                                className="text-[#0F3B2E] font-semibold underline underline-offset-2 hover:text-[#0a2a20]"
                            >
                                Student login
                            </button>
                        )}
                    </div>

                    <p className="px-5 pb-5 text-xs sm:text-sm text-gray-500">
                        By using this service you agree to adhere to WSU computing policies and guidelines.
                    </p>
                </div>
            </main>
        </div>
    );
}

export default LoginPage;
