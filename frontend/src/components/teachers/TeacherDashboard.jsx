import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import NoticeList from '../notices/NoticeList';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [teacherData, setTeacherData] = useState(null);
  const [stats, setStats] = useState({
    totalStudentsInClass: 0,
    attendanceToday: 0,
    pendingTasks: 0
  });
  const [latestSalary, setLatestSalary] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch teacher data and class-specific information
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get teacher profile data
        const teacherRes = await axios.get('/api/teachers/profile');

        if (teacherRes.data.success) {
          const teacher = teacherRes.data.data;
          setTeacherData(teacher);

          // Check if teacher has classes assigned
          const classesParam = teacher.classes && teacher.classes.length > 0 &&
                              teacher.classes[0] !== 'Not assigned' ?
                              teacher.classes.join(',') : '';

          // Get dashboard metrics specific to this teacher's classes
          const metricsRes = await axios.get('/api/dashboard/teacher-metrics', {
            params: {
              classes: classesParam
            }
          });

          if (metricsRes.data.success) {
            const { totalStudentsInClass, attendanceToday, pendingTasks, recentNotices, latestSalary } = metricsRes.data.data;

            console.log('Dashboard metrics response:', metricsRes.data);
            console.log('Latest salary data:', latestSalary);

            setStats({
              totalStudentsInClass,
              attendanceToday,
              pendingTasks
            });

            setNotices(recentNotices);
            setLatestSalary(latestSalary);
          }
        }
      } catch (error) {
        console.error('Error fetching teacher dashboard data:', error);

        // More specific error message
        if (error.response) {
          if (error.response.status === 404) {
            setError('Your teacher profile was not found. A default profile has been created. Please update your profile with your information.');
          } else {
            setError(`Failed to load dashboard data: ${error.response.data?.message || 'Please try again later.'}`);
          }
        } else if (error.request) {
          setError('No response from server. Please check your connection and try again.');
        } else {
          setError('Failed to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h1>

        {/* Welcome message */}
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name || 'Teacher'}!</h2>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening in your classes today.
          </p>

          {teacherData && teacherData.classes && teacherData.classes.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-700">Your Classes:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherData.classes.map((cls, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}

          {teacherData && teacherData.subjects && teacherData.subjects.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-medium text-gray-700">Your Subjects:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {teacherData.subjects.map((subject, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {subject}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Class Statistics</h3>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Students in your classes */}
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Students in Your Classes</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.totalStudentsInClass}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/students" className="font-medium text-blue-700 hover:text-blue-900">
                    View all students
                  </Link>
                </div>
              </div>
            </div>

            {/* Today's Attendance */}
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
                        <div className="text-lg font-medium text-gray-900">{stats.attendanceToday}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/attendance" className="font-medium text-blue-700 hover:text-blue-900">
                    Manage attendance
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stats.pendingTasks}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link to="/tasks" className="font-medium text-blue-700 hover:text-blue-900">
                    View all tasks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/attendance" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Mark Attendance</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Take attendance for your classes
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/students" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">View Students</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage students in your classes
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/events-notices" className="bg-white overflow-hidden shadow rounded-lg hover:bg-gray-50">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">Events & Notices</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      View and create events and notices
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Salary Information */}
        {console.log('Rendering with latestSalary:', latestSalary)}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900">Salary Information</h3>
          {latestSalary ? (
            <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {latestSalary.status === 'paid' && 'Your salary is paid'}
                        {latestSalary.status === 'unpaid' && 'Your salary is on hold'}
                        {latestSalary.status === 'partial' && 'Your salary is partially paid'}
                        {latestSalary.status === 'processing' && 'Your salary is being processed'}
                      </dt>
                      <dd className="mt-1">
                        {latestSalary.status === 'paid' && (
                          <div className="text-lg font-medium text-green-600">
                            Your salary of PKR {latestSalary.amount.toLocaleString()} is paid.
                          </div>
                        )}
                        {latestSalary.status === 'unpaid' && (
                          <div className="text-lg font-medium text-red-600">
                            Your salary of PKR {latestSalary.amount.toLocaleString()} is on hold.
                          </div>
                        )}
                        {latestSalary.status === 'partial' && (
                          <div className="text-lg font-medium text-yellow-600">
                            Your salary is partially paid. Received: PKR {latestSalary.paidAmount.toLocaleString()} / Total: PKR {latestSalary.amount.toLocaleString()}.
                          </div>
                        )}
                        {latestSalary.status === 'processing' && (
                          <div className="text-lg font-medium text-blue-600">
                            Your salary of PKR {latestSalary.amount.toLocaleString()} is being processed.
                          </div>
                        )}
                      </dd>
                      <dt className="mt-2 text-sm font-medium text-gray-500">
                        Month: {latestSalary.month}
                      </dt>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 bg-white shadow overflow-hidden sm:rounded-lg p-5 text-center">
              <p className="text-gray-500">No salary information available</p>
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
            <NoticeList limit={3} isDashboard={true} notices={notices} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
