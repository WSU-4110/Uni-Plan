import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CourseSearch from "../../components/CourseSearch/CourseSearch";
import wayneLogo from "../../assets/images/wayneLogo.png";

function HomePage() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
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
    <div className="min-h-screen bg-[#f0f4f3]">
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

      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <CourseSearch />
      </main>
    </div>
  );
}

export default HomePage;
