import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const AppHeader = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const profileRef = useRef(null);

  const getPageTitle = () => {
    if (location.pathname === "/") {
      return "Overview";
    }

    if (location.pathname === "/projects") {
      return "Projects";
    }

    if (location.pathname === "/projects/create") {
      return "Create Project";
    }

    if (location.pathname.startsWith("/projects/")) {
      return "Project Details";
    }

    if (location.pathname === "/change-password") {
      return "Change Password";
    }

    if (location.pathname === "/resend-email-verification") {
      return "Verify Email";
    }

    return "Project Camp";
  };

  const pageTitle = getPageTitle();

  const handleLogout = async () => {
    try {
      setProfileOpen(false);
      setMobileSidebarOpen(false);

      await logout();
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  /* Close profile dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* Close mobile sidebar when route changes */
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${isActive
      ? "bg-[#DCE8DF] dark:bg-[#30463A] text-[#355E4A] dark:text-[#DCE8DF]"
      : "text-[#6B746D] dark:text-[#B8C2BA] hover:bg-[#FCFBF8] dark:hover:bg-[#2A382F] hover:text-[#26352D] dark:hover:text-[#F1F4ED]"
    }`;

  const handleMobileNavClick = () => {
    setMobileSidebarOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-[72px] px-7 flex items-center border-b border-[#E8E3D8] dark:border-[#344238]">
        <Link
          to="/"
          onClick={handleMobileNavClick}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-[#355E4A] flex items-center justify-center text-white font-bold">
            P
          </div>

          <div>
            <h1 className="font-bold text-[#26352D] dark:text-[#F1F4ED] leading-none">
              Project Camp
            </h1>

            <p className="text-[11px] text-[#8A918B] dark:text-[#8F9C94] mt-1">
              Workspace
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">

        <p className="px-4 mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9AA19B] dark:text-[#7F8D84]">
          Workspace
        </p>

        <nav className="space-y-1">
          <NavLink
            to="/"
            className={navClass}
            onClick={handleMobileNavClick}
          >
            <span className="text-lg">⌂</span>
            Overview
          </NavLink>

          <NavLink
            to="/projects"
            className={navClass}
            onClick={handleMobileNavClick}
          >
            <span className="text-lg">▣</span>
            Projects
          </NavLink>
        </nav>

        <p className="px-4 mt-8 mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9AA19B] dark:text-[#7F8D84]">
          Account
        </p>

        <nav className="space-y-1">
          <NavLink
            to="/change-password"
            className={navClass}
            onClick={handleMobileNavClick}
          >
            <span className="text-lg">⌘</span>
            Change Password
          </NavLink>

          {!user?.isEmailVerified && (
            <NavLink
              to="/resend-email-verification"
              className={navClass}
              onClick={handleMobileNavClick}
            >
              <span className="text-lg">✉</span>
              Verify Email
            </NavLink>
          )}
        </nav>

      </div>

      {/* User section */}
      <div className="p-4 border-t border-[#E8E3D8] dark:border-[#344238]">

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFBF8] dark:bg-[#2A382F]">

          <div className="w-10 h-10 rounded-full bg-[#355E4A] text-white flex items-center justify-center font-semibold">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] truncate">
              {user?.username}
            </p>

            <p className="text-xs text-[#8A918B] dark:text-[#AAB5AE] truncate">
              {user?.email}
            </p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8A514D] dark:text-[#D89A94] hover:bg-[#FBF0EE] dark:hover:bg-[#3A2927] transition text-left"
        >
          ↪ Sign out
        </button>

      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#1F2A23] border-r border-[#E8E3D8]  dark:border-[#344238] flex-col z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1F2A23] border-r border-[#E8E3D8] dark:border-[#344238] flex flex-col z-50 lg:hidden transform transition-transform duration-300 ${mobileSidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
          }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="h-[72px] px-5 flex items-center justify-between border-b border-[#E8E3D8] dark:border-[#344238]">

          <Link
            to="/"
            onClick={handleMobileNavClick}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-[#355E4A] flex items-center justify-center text-white font-bold">
              P
            </div>

            <div>
              <h1 className="font-bold text-[#26352D] dark:text-[#F1F4ED] leading-none">
                Project Camp
              </h1>

              <p className="text-[11px] text-[#8A918B] dark:text-[#8F9C94] mt-1">
                Workspace
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="w-9 h-9 rounded-lg text-[#72776F] hover:bg-[#F7F4ED] text-xl"
          >
            ×
          </button>

        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 px-4 py-6">

          <p className="px-4 mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9AA19B] dark:text-[#7F8D84]">
            Workspace
          </p>

          <nav className="space-y-1">

            <NavLink
              to="/"
              className={navClass}
              onClick={handleMobileNavClick}
            >
              <span className="text-lg">⌂</span>
              Overview
            </NavLink>

            <NavLink
              to="/projects"
              className={navClass}
              onClick={handleMobileNavClick}
            >
              <span className="text-lg">▣</span>
              Projects
            </NavLink>

          </nav>

          <p className="px-4 mt-8 mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9AA19B] dark:text-[#7F8D84]">
            Account
          </p>

          <nav className="space-y-1">

            <NavLink
              to="/change-password"
              className={navClass}
              onClick={handleMobileNavClick}
            >
              <span className="text-lg">⌘</span>
              Change Password
            </NavLink>

            {!user?.isEmailVerified && (
              <NavLink
                to="/resend-email-verification"
                className={navClass}
                onClick={handleMobileNavClick}
              >
                <span className="text-lg">✉</span>
                Verify Email
              </NavLink>
            )}

          </nav>

        </div>

        {/* Mobile User section */}
        <div className="p-4 border-t border-[#E8E3D8] dark:border-[#344238]">

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FCFBF8] dark:bg-[#2A382F]" >

            <div className="w-10 h-10 rounded-full bg-[#355E4A] text-white flex items-center justify-center font-semibold">
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED] truncate">
                {user?.username}
              </p>

              <p className="text-xs text-[#8A918B] dark:text-[#AAB5AE] truncate">
                {user?.email}
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#8A514D] dark:text-[#D89A94] hover:bg-[#FBF0EE] dark:hover:bg-[#3A2927] transition text-left"
          >
            ↪ Sign out
          </button>

        </div>
      </aside>

      {/* Top Bar */}
      <header className="lg:ml-64 h-[72px] bg-white dark:bg-[#1F2A23] border-b border-[#E8E3D8] dark:border-[#344238] flex items-center justify-between px-5 sm:px-8 sticky top-0 z-30">

        {/* Mobile hamburger + logo */}
        <div className="flex items-center gap-3 lg:hidden">

          <button
            onClick={() =>
              setMobileSidebarOpen(true)
            }
            className="w-9 h-9 rounded-lg text-[#355E4A] dark:text-[#6F9B82] hover:bg-[#F7F4ED] dark:hover:bg-[#2A382F] text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>

          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-[#355E4A] flex items-center justify-center text-white font-bold">
              P
            </div>

            <span className="font-bold text-[#26352D] dark:text-[#F1F4ED]">
              Project Camp
            </span>
          </Link>

        </div>

        {/* Desktop title */}
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-[#566159]  dark:text-[#AAB5AE]">
            {pageTitle}
          </p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">

          {/* Profile */}
          <div
            ref={profileRef}
            className="relative"
          >

            <button
              onClick={() =>
                setProfileOpen((prev) => !prev)
              }
              className="flex items-center gap-3"
            >

              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED]">
                  {user?.username}
                </p>

                <p className="text-xs text-[#8A918B] dark:text-[#AAB5AE]">
                  Account
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-[#DCE8DF] dark:bg-[#30463A] text-[#355E4A] dark:text-[#DCE8DF] flex items-center justify-center font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <span className="text-[#8A918B] dark:text-[#AAB5AE] text-xs">
                ▼
              </span>

            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#1F2A23] border border-[#E8E3D8] dark:border-[#344238] rounded-xl shadow-lg p-2">

                <div className="px-3 py-3 border-b border-[#EAEDE8] dark:border-[#344238] mb-1">

                  <p className="text-sm font-semibold text-[#26352D] dark:text-[#F1F4ED]">
                    {user?.username}
                  </p>

                  <p className="text-xs text-[#8A918B] dark:text-[#AAB5AE] mt-1 truncate">
                    {user?.email}
                  </p>

                </div>

                <Link
                  to="/change-password"
                  onClick={() => setProfileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[#566159] dark:text-[#AAB5AE] hover:bg-[#FCFBF8] dark:hover:bg-[#2A382F] "
                >
                  Change Password
                </Link>

                {!user?.isEmailVerified && (
                  <Link
                    to="/resend-email-verification"
                    onClick={() => setProfileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-[#566159] dark:text-[#AAB5AE] hover:bg-[#FCFBF8] dark:hover:bg-[#2A382F]"
                  >
                    Verify Email
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[#8A514D] dark:text-[#D89A94] hover:bg-[#FBF0EE] dark:hover:bg-[#3A2927]"
                >
                  Sign out
                </button>

              </div>
            )}

          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl text-[#566159] dark:text-[#AAB5AE] hover:bg-[#FCFBF8] dark:hover:bg-[#2A382F] transition"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "☾" : "☀"}
          </button>

        </div>

      </header>
    </>
  );
};

export default AppHeader;