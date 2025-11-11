import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StudentAttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: ''
  });
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    halfDays: 0,
    attendancePercentage: 0
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (studentData) {
      fetchAttendanceRecords();
    }
  }, [studentData, filters]);

  const fetchStudentData = async () => {
    try {
      // For students, the backend automatically filters by the logged-in user's ID
      // No need to pass any query parameters
      const res = await axios.get('/api/students');

      if (res.data.success && res.data.data.length > 0) {
        setStudentData(res.data.data[0]);
      } else {
        setError('Student profile not found. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      if (error.response?.status === 403) {
        setError('Access denied. Please make sure you are logged in as a student.');
      } else if (error.response?.status === 404) {
        setError('Student profile not found. Please contact your administrator.');
      } else {
        setError('Failed to load student data. Please try again later.');
      }
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);

      // For students, the backend automatically filters by the logged-in user's ID
      // We only need to pass sorting and status filters
      const params = {
        sort: '-date'
      };

      // Add status filter if specified
      if (filters.status) {
        params.status = filters.status;
      }

      console.log('Fetching attendance with params:', params);
      const res = await axios.get('/api/attendance', { params });

      if (res.data.success) {
        let records = res.data.data;

        // Apply client-side filtering for month/year if needed
        if (filters.month && filters.year) {
          records = records.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getFullYear() === parseInt(filters.year) &&
                   (recordDate.getMonth() + 1) === parseInt(filters.month);
          });
        }

        setAttendanceRecords(records);
        calculateStats(records);
      } else {
        setError('Failed to load attendance records: ' + (res.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      if (error.response?.status === 400) {
        setError('Invalid request. Please try refreshing the page.');
      } else if (error.response?.status === 404) {
        setError('No attendance records found.');
      } else {
        setError('Failed to load attendance records. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const totalDays = records.length;
    const presentDays = records.filter(record => record.status === 'present').length;
    const absentDays = records.filter(record => record.status === 'absent').length;
    const lateDays = records.filter(record => record.status === 'late').length;
    const halfDays = records.filter(record => record.status === 'half-day').length;

    const attendancePercentage = totalDays > 0 ?
      (((presentDays + lateDays + (halfDays * 0.5)) / totalDays) * 100).toFixed(1) : 0;

    setStats({
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      attendancePercentage
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      'half-day': 'bg-orange-100 text-orange-800',
      leave: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const generateMonthOptions = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.map((month, index) => (
      <option key={index + 1} value={index + 1}>{month}</option>
    ));
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years.map(year => (
      <option key={year} value={year}>{year}</option>
    ));
  };

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
        <PageHeader
          title="My Attendance"
          subtitle="View your attendance records and statistics"
        />

        {/* Student Info */}
        {studentData && (
          <div className="mt-4 bg-white shadow rounded-lg p-6">
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
                <h3 className="text-sm font-medium text-gray-700">Name:</h3>
                <p className="text-lg font-semibold text-school-navy">{user.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Statistics */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Days</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalDays}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

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
                    <dt className="text-sm font-medium text-gray-500 truncate">Present</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.presentDays}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Absent</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.absentDays}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Late</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.lateDays}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Half Day</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.halfDays}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Percentage</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.attendancePercentage}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
              <select
                id="month"
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
              >
                {generateMonthOptions()}
              </select>
            </div>

            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
              <select
                id="year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
              >
                {generateYearOptions()}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-school-yellow focus:border-school-yellow sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="leave">Leave</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Records</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Your attendance history for the selected period.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="px-4 py-5 sm:px-6">
              <p className="text-gray-500">No attendance records found for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAttendancePage;
