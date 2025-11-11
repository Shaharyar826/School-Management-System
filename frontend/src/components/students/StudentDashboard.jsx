import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import NoticeList from '../notices/NoticeList';
import { formatDateForDisplay } from '../../utils/dateUtils';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [studentData, setStudentData] = useState(null);
  const [stats, setStats] = useState({
    totalAttendance: 0,
    presentDays: 0,
    absentDays: 0,
    attendancePercentage: 0,
    pendingFees: 0,
    totalFees: 0,
    overdueFees: 0,
    unreadNotifications: 0
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentFees, setRecentFees] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      // Use the student-specific dashboard endpoint
      const dashboardRes = await axios.get('/api/dashboard/student-metrics');

      if (dashboardRes.data.success) {
        const data = dashboardRes.data.data;
        
        setStudentData(data.student);
        
        // Set stats with proper fee calculations
        setStats({
          totalAttendance: data.attendance.totalDays,
          presentDays: data.attendance.presentDays,
          absentDays: data.attendance.totalDays - data.attendance.presentDays,
          attendancePercentage: data.attendance.percentage,
          pendingFees: data.fees.pendingFees || 0,
          totalFees: data.fees.totalFees || 0,
          overdueFees: data.fees.overdue || 0,
          unreadNotifications: data.unreadNotificationsCount || 0
        });
        
        setNotices(data.recentNotices || []);
        
        // Fetch recent attendance
        try {
          const attendanceRes = await axios.get('/api/attendance', {
            params: { sort: '-date', limit: 10 }
          });
          if (attendanceRes.data.success) {
            setRecentAttendance(attendanceRes.data.data);
          }
        } catch (error) {
          console.error('Error fetching attendance:', error);
          setRecentAttendance([]);
        }
        
        // Fetch recent fees with proper error handling
        try {
          const feeRes = await axios.get('/api/fees', {
            params: { sort: '-dueDate', limit: 5 }
          });
          if (feeRes.data.success) {
            setRecentFees(feeRes.data.data);
          }
        } catch (error) {
          console.error('Error fetching fees:', error);
          setRecentFees([]);
        }
      } else {
        setError('Failed to load dashboard data.');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Please make sure you are logged in as a student.');
      } else if (error.response?.status === 404) {
        setError('Student profile not found. Please contact your administrator.');
      } else {
        setError('Failed to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-school-yellow"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>

        {/* Welcome message */}
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name || 'Student'}!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's your academic overview and recent activities.
          </p>

          {studentData && (
            <div className="mt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Roll Number:</h3>
                  <p className="text-lg font-semibold text-school-navy">{studentData.rollNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Class:</h3>
                  <p className="text-lg font-semibold text-school-navy">{studentData.class} - {studentData.section}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Admission Date:</h3>
                  <p className="text-lg font-semibold text-school-navy">
                    {formatDateForDisplay(studentData.admissionDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Attendance Percentage */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Attendance</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.attendancePercentage}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Present Days */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Present Days</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.presentDays}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Fees */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Fees</dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.pendingFees.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Fees */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue Fees</dt>
                    <dd className="text-lg font-medium text-gray-900">₹{stats.overdueFees.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/student-attendance" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">View Attendance</h3>
                    <p className="mt-1 text-sm text-gray-500">Check your attendance records</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/student-fees" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">View Fees</h3>
                    <p className="mt-1 text-sm text-gray-500">Check fee status and payments</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/notifications" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">View important updates</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/events-notices" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Events & Notices</h3>
                    <p className="mt-1 text-sm text-gray-500">View school announcements</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Attendance</h3>
                <Link to="/student-attendance" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
              <div className="mt-4">
                {recentAttendance.length > 0 ? (
                  <div className="space-y-3">
                    {recentAttendance.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDateForDisplay(record.date)}
                          </p>
                        </div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'half-day' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No attendance records found</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Fees */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Fees</h3>
                <Link to="/student-fees" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
              <div className="mt-4">
                {recentFees.length > 0 ? (
                  <div className="space-y-3">
                    {recentFees.slice(0, 5).map((fee, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {fee.feeType?.charAt(0).toUpperCase() + fee.feeType?.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Due: {formatDateForDisplay(fee.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{(parseFloat(fee.remainingAmount) || 0).toLocaleString()}
                          </p>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                            fee.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                            fee.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {fee.status?.charAt(0).toUpperCase() + fee.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No fee records found</p>
                )}
              </div>
            </div>
          </div>
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

export default StudentDashboard;