import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import PublicDataContext from '../../context/PublicDataContext';
// importing logo from assets folder
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { clearCache, forceRefresh } = useContext(PublicDataContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if the current route is active
  const isActive = (path) => location.pathname === path;

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation variants
  const navbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      color: '#E6B800', // school-yellow-dark
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.nav
      className={`fixed w-full z-[9999] transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-white bg-opacity-90 py-4 dark:bg-gray-900 dark:bg-opacity-90'
      }`}
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.img
              src={logo}
              alt="School Logo"
              className="h-10 w-10"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/40?text=CBHS';
              }}
            />
            <motion.span
              className="text-xl font-bold text-school-navy-dark"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Community HS
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden navbar:flex items-center space-x-6">
            <motion.div
              className="flex items-center space-x-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Home
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/about"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/about')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  About Us
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/admissions"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/admissions')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Admissions
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/academics"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/academics')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Academics
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/faculty"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/faculty')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Faculty
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/events"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/events')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Events
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/contact"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/contact')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Contact
                </Link>
              </motion.div>
              <motion.div whileHover="hover" variants={linkVariants}>
                <Link
                  to="/gallery"
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive('/gallery')
                      ? 'text-school-yellow-dark border-b-2 border-school-yellow'
                      : 'text-school-navy-dark hover:text-school-yellow-dark'
                  }`}
                >
                  Gallery
                </Link>
              </motion.div>
            </motion.div>

            <div className="flex items-center space-x-3">
              {/* Test Loading Button - Remove in production */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <button
                  onClick={() => {
                    clearCache();
                    forceRefresh();
                  }}
                  className="px-3 py-1 text-xs rounded-md bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200"
                  title="Test Loading State"
                >
                  Test Load
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md bg-school-yellow text-school-navy-dark font-medium hover:bg-school-yellow-dark transition-colors duration-200"
                >
                  Login
                </Link>
              </motion.div>

              {isAuthenticated && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md bg-school-navy text-white font-medium hover:bg-school-navy-dark transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="navbar:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-school-navy-dark focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div
          className="navbar:hidden z-[9999]"
          initial="closed"
          animate="open"
          exit="closed"
          variants={mobileMenuVariants}
        >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg relative">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/about')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            to="/admissions"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/admissions')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Admissions
          </Link>
          <Link
            to="/academics"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/academics')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Academics
          </Link>
          <Link
            to="/faculty"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/faculty')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Faculty
          </Link>
          <Link
            to="/events"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/events')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Events
          </Link>
          <Link
            to="/contact"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/contact')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/gallery"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive('/gallery')
                ? 'bg-school-yellow-light text-school-navy-dark'
                : 'text-school-navy hover:bg-school-gray hover:text-school-navy-dark'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            to="/login"
            className="block px-3 py-2 rounded-md text-base font-medium bg-school-yellow text-school-navy-dark hover:bg-school-yellow-dark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Login
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium bg-school-navy text-white hover:bg-school-navy-dark"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
