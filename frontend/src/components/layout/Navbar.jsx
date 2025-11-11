import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ProfileAvatar from '../common/ProfileAvatar';
import NotificationBadge from '../common/NotificationBadge';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="school-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex flex-1">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="school-navbar-brand flex items-center">
                <img
                  src="/logo.png"
                  alt="School Logo"
                  className="h-10 w-10 mr-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
                Community Based HS
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden navbar:ml-6 navbar:flex navbar:space-x-6 overflow-x-auto navbar-items-container">
              <Link to="/" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                Home
              </Link>

              {user && (
                <>
                  <Link to="/dashboard" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                    Dashboard
                  </Link>

                  {['admin', 'principal', 'vice-principal'].includes(user?.role) && (
                    <>
                      <Link to="/teachers" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                        Teachers
                      </Link>
                      <Link to="/students" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                        Students
                      </Link>
                    </>
                  )}

                  {/* Pending Approvals - Only for Admin and Principal */}
                  {['admin', 'principal'].includes(user?.role) && (
                    <Link to="/pending-approvals" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                      <span className="flex items-center">
                        Approvals
                        <span className="ml-1 bg-school-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          !
                        </span>
                      </span>
                    </Link>
                  )}

                  <Link to="/attendance" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                    Attendance
                  </Link>

                  <Link to="/notices" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                    Notices
                  </Link>

                  {['admin', 'principal'].includes(user?.role) && (
                    <>
                      <Link to="/fees" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                        Fees
                      </Link>
                      <Link to="/salaries" className="school-navbar-link inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-school-navy-dark">
                        Salaries
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hidden navbar:flex navbar:items-center navbar:ml-6 lg:ml-8">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notification Badge */}
                <NotificationBadge />

                {/* Link to Meetings */}
                <Link to="/meetings" className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400 hover:text-school-yellow transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </Link>

                {/* Direct Profile Edit Button removed - now in user profile page */}
                <div className="relative" ref={dropdownRef}>
                  <div
                    className="flex items-center px-3 py-1 bg-school-navy-dark bg-opacity-10 rounded-full cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown();
                    }}
                  >
                    <ProfileAvatar
                      profileImage={user.profileImage}
                      name={user.name}
                      user={user}
                      size="sm"
                      className="mr-2"
                    />
                    <span className="text-sm text-school-navy-dark font-medium truncate max-w-[120px]">{user.name}</span>
                  </div>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[100] dropdown-menu-fix navbar-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.role === 'teacher' && (
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative z-[1001] dropdown-menu-fix"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDropdownOpen(false);
                            navigate('/profile');
                          }}
                        >
                          My Profile
                        </Link>
                      )}
                      {/* Admin/Principal profile edit option removed - now using dedicated button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 relative z-[1001] dropdown-menu-fix"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="school-button school-button-primary whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                <Link
                  to="/login"
                  className="school-button school-button-primary"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center navbar:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-school-navy-dark hover:text-school-navy hover:bg-school-yellow-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-school-yellow"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="navbar:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="bg-school-yellow-light border-school-yellow text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Home
            </Link>

            {user && (
              <>
                <Link to="/dashboard" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Dashboard
                </Link>

                {['admin', 'principal', 'vice-principal'].includes(user?.role) && (
                  <>
                    <Link to="/teachers" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      Teachers
                    </Link>
                    <Link to="/students" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      Students
                    </Link>
                  </>
                )}

                {/* Pending Approvals - Only for Admin and Principal */}
                {['admin', 'principal'].includes(user?.role) && (
                  <Link to="/pending-approvals" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    <span className="flex items-center">
                      Approvals
                      <span className="ml-1 bg-school-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        !
                      </span>
                    </span>
                  </Link>
                )}

                <Link to="/attendance" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Attendance
                </Link>

                <Link to="/events-notices" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Events & Notices
                </Link>

                <Link to="/meetings" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Meetings
                </Link>

                <Link to="/notifications" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                  Notifications
                </Link>

                {/* Profile Links */}
                {user.role === 'teacher' && (
                  <Link to="/profile" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                    My Profile
                  </Link>
                )}
                {/* Admin/Principal profile edit option removed - now using dedicated button */}

                {['admin', 'principal'].includes(user?.role) && (
                  <>
                    <Link to="/fees" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      Fees
                    </Link>
                    <Link to="/salaries" className="border-transparent text-school-navy-dark hover:bg-school-yellow-light hover:border-school-yellow hover:text-school-navy-dark block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      Salaries
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-school-navy-light">
            {user ? (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <ProfileAvatar
                    profileImage={user.profileImage}
                    name={user.name}
                    user={user}
                    size="md"
                    className="cursor-pointer"
                    onClick={() => {
                      navigate('/user-profile');
                      setIsOpen(false);
                    }}
                  />
                </div>
                <div
                  className="ml-3 cursor-pointer"
                  onClick={() => {
                    navigate('/user-profile');
                    setIsOpen(false);
                  }}
                  
                >
                  <div className="text-base font-medium text-school-navy-dark">{user.name}</div>
                  <div className="text-sm font-medium text-school-navy">{user.email}</div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  {/* Theme Toggle */}
                  <ThemeToggle className="flex-shrink-0" />

                  {/* Direct Profile Edit Button removed - now in user profile page */}

                  {user.role === 'teacher' && (
                    <Link
                      to="/profile"
                      className="bg-school-yellow flex-shrink-0 p-1 rounded-full text-school-navy-dark hover:bg-school-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-yellow"
                    >
                      <span className="sr-only">My Profile</span>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-school-yellow flex-shrink-0 p-1 rounded-full text-school-navy-dark hover:bg-school-orange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-school-yellow"
                  >
                    <span className="sr-only">Logout</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center space-x-4 px-4">
                {/* Theme Toggle */}
                <ThemeToggle className="flex-shrink-0" />

                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-school-navy-dark hover:text-school-navy hover:bg-school-yellow-light"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
