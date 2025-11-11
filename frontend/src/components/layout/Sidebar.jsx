import { useState, useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import ProfileAvatar from '../common/ProfileAvatar';
import ContactMessageBadge from '../contact/ContactMessageBadge';
import {
  FaHome,
  // Icon for settings,
  FaCog,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaBullhorn,
  FaUserCheck,
  FaChevronLeft,
  FaChevronRight,
  FaUserCog,
  FaUserTie,
  FaUser,
  FaUpload,
  FaHistory,
  FaEnvelope,
  FaEdit
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Define navigation items based on user role
  const navItems = useMemo(() => {
    if (!user) return [];

    const items = [
      {
        path: '/dashboard',
        name: 'Dashboard',
        icon: <FaHome className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
      }
    ];

    // Admin, Principal, Vice Principal can access all modules
    if (['admin', 'principal', 'vice-principal'].includes(user.role)) {
      items.push(
        {
          path: '/teachers',
          name: 'Teachers',
          icon: <FaChalkboardTeacher className="w-5 h-5" />,
          allowedRoles: ['admin', 'principal', 'vice-principal']
        },
        {
          path: '/support-staff',
          name: 'Support Staff',
          icon: <FaUserCog className="w-5 h-5" />,
          allowedRoles: ['admin', 'principal', 'vice-principal']
        }
      );
    }

    // Students - accessible by admin, principal, vice-principal, and teachers
    if (['admin', 'principal', 'vice-principal', 'teacher'].includes(user.role)) {
      items.push({
        path: '/students',
        name: 'Students',
        icon: <FaUserGraduate className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher']
      });
    }

    // Only Admin and Principal can access admin staff
    if (['admin', 'principal'].includes(user.role)) {
      items.push({
        path: '/admin-staff',
        name: 'Admin Staff',
        icon: <FaUserTie className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });
    }

    // Approvals section removed as it's no longer needed

    // Only Admin can access bulk upload
    if (user.role === 'admin') {
      items.push({
        path: '/upload',
        name: 'Bulk Upload',
        icon: <FaUpload className="w-5 h-5" />,
        allowedRoles: ['admin']
      });
    }

    // Attendance - different paths for different roles
    if (user.role === 'student') {
      items.push({
        path: '/student-attendance',
        name: 'My Attendance',
        icon: <FaCalendarAlt className="w-5 h-5" />,
        allowedRoles: ['student']
      });
    } else {
      items.push({
        path: '/attendance',
        name: 'Attendance',
        icon: <FaCalendarAlt className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher']
      });
    }

    // Fees - different paths for different roles
    if (user.role === 'student') {
      items.push({
        path: '/student-fees',
        name: 'My Fees',
        icon: <FaMoneyBillWave className="w-5 h-5" />,
        allowedRoles: ['student']
      });
    } else if (['admin', 'principal', 'accountant'].includes(user.role)) {
      items.push(
        {
          path: '/fees',
          name: 'Fees',
          icon: <FaMoneyBillWave className="w-5 h-5" />,
          allowedRoles: ['admin', 'principal', 'accountant']
        },
        {
          path: '/salaries',
          name: 'Salaries',
          icon: <FaMoneyBillWave className="w-5 h-5" />,
          allowedRoles: ['admin', 'principal', 'accountant']
        }
      );
    }

    // Everyone can access events and notices
    items.push({
      path: '/events-notices',
      name: 'Events & Notices',
      icon: <FaBullhorn className="w-5 h-5" />,
      allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
    });

    // Only admin and principal can access history and contact messages
    if (['admin', 'principal'].includes(user.role)) {
      // Contact Messages
      items.push({
        path: '/contact-messages',
        name: 'Contact Messages',
        icon: <FaEnvelope className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal'],
        badge: <ContactMessageBadge />
      });

      // History
      items.push({
        path: '/history',
        name: 'History',
        icon: <FaHistory className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });

      // School Settings (using the revamped version)
      items.push({
        path: '/school-settings',
        name: 'School Settings',
        icon: <FaCog className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });

      // Content Management
      items.push({
        path: '/content-management',
        name: 'Content Management',
        icon: <FaEdit className="w-5 h-5" />,
        allowedRoles: ['admin', 'principal']
      });
    }

    // All users can access their profile
    items.push({
      path: '/profile',
      name: 'View Profile',
      icon: <FaUser className="w-5 h-5" />,
      allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
    });

    // All users can access their profile page
    items.push({
      path: '/user-profile',
      name: 'Profile Settings',
      icon: <FaCog className="w-5 h-5" />,
      allowedRoles: ['admin', 'principal', 'vice-principal', 'teacher', 'student', 'accountant']
    });

    return items.filter(item => item.allowedRoles.includes(user.role));
  }, [user]);

  return (
    <div className={`school-sidebar h-auto min-h-full ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out relative z-20`}>
      <div className="school-sidebar-header flex justify-between items-center p-4 border-b border-school-navy-light">
        {!collapsed && (
          <h2 className="text-xl font-bold">Community HS</h2>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-school-navy-light focus:outline-none"
        >
          {collapsed ? <FaChevronRight className="text-school-yellow" /> : <FaChevronLeft className="text-school-yellow" />}
        </button>
      </div>

      <nav className="mt-5">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`school-sidebar-item ${
                  isActive(item.path)
                    ? 'school-sidebar-item-active'
                    : 'school-sidebar-item-inactive'
                }`}
              >
                <span className="mr-3 school-sidebar-icon relative">
                  {item.icon}
                  {item.badge && (
                    <span className="absolute">
                      {item.badge}
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!collapsed && user && (
        <div className="relative w-full p-4 mt-8 border-t border-school-navy-light">
          <div className="flex items-center">
            <ProfileAvatar
              profileImage={user.profileImage}
              name={user.name}
              user={user}
              size="md"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-school-yellow capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
