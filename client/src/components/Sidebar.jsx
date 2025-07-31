import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CATEGORIES } from "../utils/constants";
import { AvatarDisplay } from "./ui";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  // Check if we're currently on a category page
  const currentCategory = location.pathname.startsWith('/category/') 
    ? location.pathname.split('/category/')[1] 
    : null;

  // Check current page for menu items
  const currentPage = location.pathname;

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsSidebarOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const categories = CATEGORIES;

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Open categories dropdown if user is on a category page
  useEffect(() => {
    if (currentCategory) {
      setIsCategoriesOpen(true);
    }
  }, [currentCategory]);

  // Close menu dropdown if user is not on a menu page
  useEffect(() => {
    const menuPages = ['/', '/authors', '/about', '/contact', '/profile'];
    if (!menuPages.includes(currentPage)) {
      setIsMenuOpen(false);
    }
  }, [currentPage]);

  // Close admin menu dropdown if user is not on an admin page
  useEffect(() => {
    const adminPages = ['/admin/dashboard', '/admin/articles', '/admin/users'];
    if (!adminPages.includes(currentPage)) {
      setIsAdminMenuOpen(false);
    }
  }, [currentPage]);

  // Add event listener for escape key to close sidebar
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && isSidebarOpen) {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleEsc);

    // Clean up event listener
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isSidebarOpen]);

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex-1 flex justify-center">
              <Link to="/" className="flex items-center">
                <div className="py-1 px-3 bg-black rounded-sm flex items-center justify-center mr-1.5">
                  <span className="text-xl text-white font-bold font-playfair tracking-[0.05em]">
                    Atjèh
                  </span>
                </div>
                <span className="text-2xl font-bold text-black font-playfair tracking-[0.05em]">
                  Times
                </span>
              </Link>
            </div>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Search Bar - Toggleable */}
          {isSearchOpen && (
            <div className="pb-4 px-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  autoFocus
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar and Overlay Container */}
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
          aria-label="Close sidebar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeSidebar();
            }
          }}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" className="flex items-center" onClick={closeSidebar}>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center">
                  <div className="py-1 px-3 bg-black rounded-sm flex items-center justify-center mr-1.5">
                    <span className="text-xl text-white font-bold font-playfair">
                      Atjèh
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-black font-playfair">
                    Times
                  </span>
                </div>
              </div>
            </Link>
            <button
              onClick={closeSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User Section */}
          {user && (
            <div className="p-2 border-b border-gray-200">
              <Link 
                to="/profile" 
                onClick={closeSidebar}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <AvatarDisplay
                  avatar={user.avatar}
                  userInitials={`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 hover:text-blue-700 truncate">
                    {user.fullName ||
                      `${user.firstName || ""} ${user.lastName || ""}` ||
                      user.username}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {user.role}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {/* Menu Dropdown */}
              <div className="pt-4">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  <span>Menu</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className="mt-2 space-y-1">
                    <Link
                      to="/"
                      className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      onClick={closeSidebar}
                    >
                      <svg
                        className="h-5 w-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Home
                    </Link>
                    {user && (
                      <Link
                        to="/profile"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Profile
                      </Link>
                    )}
                    <Link
                      to="/authors"
                      className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      onClick={closeSidebar}
                    >
                      <svg
                        className="h-5 w-5 mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                        />
                      </svg>
                      Authors
                    </Link>
                    <Link
                      to="/about"
                      className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      onClick={closeSidebar}
                    >
                      <svg
                        className="h-5 w-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      About
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      onClick={closeSidebar}
                    >
                      <svg
                        className="h-5 w-5 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Contact
                    </Link>
                  </div>
                )}
              </div>

              {/* Admin Menu Dropdown - Admin Only */}
              {user?.role === "admin" && (
                <div className="pt-4">
                  <button
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <span>Admin Menu</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isAdminMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isAdminMenuOpen && (
                    <div className="mt-2 space-y-1">
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/articles"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Manage Articles
                      </Link>
                      <Link
                        to="/admin/users"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        Manage Users
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions - Author Only */}
              {user?.role === "author" || user?.role === "admin" && (
                <div className="pt-4">
                  <button
                    onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                    className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <span>Quick Actions</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isQuickActionsOpen && (
                    <div className="mt-2 space-y-1">
                      <Link
                        to="/author/articles/create"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create Article
                      </Link>
                      <Link
                        to="/author/articles"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Manage Articles
                      </Link>
                      <Link
                        to="/author/dashboard"
                        className="flex items-center px-6 py-2 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        onClick={closeSidebar}
                      >
                        <svg
                          className="h-5 w-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Categories Section */}
              <div className="pt-4">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors
                    ${currentCategory
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span>Categories</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isCategoriesOpen && (
                  <div className="mt-2 space-y-1">
                    {categories.map((category) => (
                      <Link
                        key={category.value}
                        to={`/category/${category.value}`}
                        className={`
                          flex items-center px-6 py-2 text-sm rounded-lg transition-colors
                          ${currentCategory === category.value
                            ? 'text-blue-600 bg-blue-50 font-medium'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                          }
                        `}
                        onClick={closeSidebar}
                      >
                        <span className={`w-2 h-2 rounded-full mr-3 ${
                          currentCategory === category.value ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></span>
                        {category.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 p-4">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <svg
                    className="h-5 w-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-black border border-black rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={closeSidebar}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={closeSidebar}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
