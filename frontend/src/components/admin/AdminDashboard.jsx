import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import ConfirmationModal from '../common/ConfirmationModal';
import PasswordResetRequests from './PasswordResetRequests';
import NoticeList from '../notices/NoticeList';
import { useDashboardStats } from '../../hooks/useDashboard';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState({ message: '', type: '' });
  const [isResetting, setIsResetting] = useState(false);

  // React Query hook for dashboard data
  const { data: dashboardData, isLoading: loading, error: queryError } = useDashboardStats(user?.role);
  
  const stats = {
    totalStudents: dashboardData?.totalStudents || 0,
    totalTeachers: dashboardData?.totalTeachers || 0,
    pendingApprovals: dashboardData?.pendingApprovals || 0,
    feesDue: dashboardData?.feesDue || 0,
    passwordResetRequests: dashboardData?.passwordResetRequests || 0
  };
  
  const notices = dashboardData?.recentNotices || [];
  const passwordResetCount = dashboardData?.passwordResetRequests || 0;
  const error = queryError?.response?.data?.message || (queryError ? 'Failed to load dashboard data' : '');

  // Function to handle database reset
  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      setResetStatus({ message: '', type: '' });

      const response = await axios.post('/api/system/reset-database');

      if (response.data.success) {
        setResetStatus({
          message: 'Database reset successfully. Default admin accounts have been recreated.',
          type: 'success'
        });

        // React Query will automatically refresh data

        // Close the modal
        setIsResetModalOpen(false);

        // Show success message briefly, then reload the page
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1.5 seconds delay to show the success message

        return; // Early return to prevent the finally block from executing
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      setResetStatus({
        message: `Failed to reset database: ${error.response?.data?.message || error.message}`,
        type: 'error'
      });
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  // React Query handles data fetching automatically

  // If not authenticated, show loading
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

          {/* Only show to admin users */}
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Reset Database'}
            </button>
          )}
        </div>

        {/* Reset status message */}
        {resetStatus.message && (
          <div className={`mt-4 p-4 rounded-md ${resetStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p>{resetStatus.message}</p>
          </div>
        )}

        {/* Welcome message */}
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name || 'Admin'}!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's an overview of your school management system.
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stats.pendingApprovals}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#pending-approvals" className="font-medium text-blue-600 hover:text-blue-500">View below</a>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Password Reset Requests</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{passwordResetCount}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#password-reset-requests" className="font-medium text-blue-600 hover:text-blue-500">View below</a>
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
        {!loading && (
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
        )}

        {/* Password Reset Requests Section */}
        {!loading && (
          <div id="password-reset-requests" className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Password Reset Requests</h3>
            {passwordResetCount > 0 ? (
              <div className="school-alert school-alert-warning mb-4">
                <p>You have {passwordResetCount} pending password reset {passwordResetCount === 1 ? 'request' : 'requests'} that require your attention.</p>
              </div>
            ) : null}
            <PasswordResetRequests />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetDatabase}
        title="Reset Database"
        message="Are you sure you want to reset the database? This will delete ALL data except the system structure and default admin accounts. This action CANNOT be undone!"
        confirmButtonText="Yes, Reset Database"
        cancelButtonText="Cancel"
        isDangerous={true}
      />
    </div>
  );
};

export default AdminDashboard;
