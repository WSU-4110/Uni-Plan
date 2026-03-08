import { useState } from "react";
import { useNavigate } from "react-router-dom";

import wayneLogo from "../../assets/images/wayneLogo.png";
import person from "../../assets/images/person.png";
import lock from "../../assets/images/lock.png";
import checkmark from "../../assets/images/checkmark.png";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (data.success) {
                navigate("/home", { replace: true });
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
            <div className="sticky top-0 w-full h-[77px] bg-[#0F3B2E] flex items-center px-[5%] z-10 gap-3">
                <img
                    src={wayneLogo}
                    alt="Wayne State University Logo"
                    className="h-[clamp(30px,5vw,40px)] w-auto flex-shrink-0"
                />
                <h1 className="text-white font-serif text-[clamp(14px,2.5vw,20px)] leading-tight">
                    WAYNE STATE UNIVERSITY
                </h1>
            </div>

            <div className="w-[95%] sm:max-w-[500px] mx-auto mt-6 bg-white border border-[#ddd] rounded-lg shadow-sm">
                <h2 className="text-[#0F3B2E] pt-[27px] pl-[10px]">Academica Login</h2>

                <p className="px-5 pt-3 pb-2 text-sm sm:text-base text-gray-700">
                    You have reached a page that requires authentication,
                    please enter your Username and password.
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
                            className="flex items-center gap-2 bg-[whitesmoke] text-[#1ab02b] border border-[darkgrey] px-5 py-2.5 rounded font-semibold cursor-pointer disabled:opacity-50"
                        >
                            <img src={checkmark} className="w-5 h-5" alt="Checkmark icon" />
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>

                <p className="px-5 pb-5 text-xs sm:text-sm text-gray-500">
                    By using this service you agree to adhere to WSU computing policies and guidelines.
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
