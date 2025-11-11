import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import TeacherDashboard from '../teachers/TeacherDashboard';
import StudentDashboard from '../students/StudentDashboard';
import NoticeList from '../notices/NoticeList';
import { useDashboardStats } from '../../hooks/useDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // If user is admin or principal, show admin dashboard
  if (user && (user.role === 'admin' || user.role === 'principal')) {
    return <AdminDashboard />;
  }

  // If user is teacher, show teacher dashboard
  if (user && user.role === 'teacher') {
    return <TeacherDashboard />;
  }

  // If user is student, show student dashboard
  if (user && user.role === 'student') {
    return <StudentDashboard />;
  }

  // For other users, show regular dashboard with React Query
  const { data: dashboardData, isLoading: loading, error: queryError } = useDashboardStats(user?.role);
  
  const stats = {
    totalStudents: dashboardData?.totalStudents || 0,
    totalTeachers: dashboardData?.totalTeachers || 0,
    todayAttendance: dashboardData?.todayAttendance || 0,
    feesDue: dashboardData?.feesDue || 0
  };
  
  const notices = dashboardData?.recentNotices || [];
  const error = queryError?.response?.data?.message || (queryError ? 'Failed to load dashboard data' : '');

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        {/* Welcome message */}
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name || 'User'}!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening in your school today.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">School Statistics</h3>

          {loading ? (
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-4 py-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalStudents}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/students" className="font-medium text-blue-600 hover:text-blue-500">View all</Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Teachers</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.totalTeachers}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/teachers" className="font-medium text-blue-600 hover:text-blue-500">View all</Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Today's Attendance</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.todayAttendance}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/attendance" className="font-medium text-blue-600 hover:text-blue-500">View details</Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Fees Due</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">₹{stats.feesDue.toLocaleString()}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Link to="/fees" className="font-medium text-blue-600 hover:text-blue-500">View all</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Events & Notices */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Events & Notices</h3>
            <Link to="/events-notices" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all
            </Link>
          </div>
          <div className="mt-2">
            <NoticeList limit={3} showAddButton={false} isDashboard={true} notices={notices} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
