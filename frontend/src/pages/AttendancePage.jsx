import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import MarkAttendanceModal from '../components/attendance/MarkAttendanceModal';

const AttendancePage = () => {
  const { user } = useContext(AuthContext);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    date: new Date().toISOString().split('T')[0],
    userType: 'student', // 'student', 'teacher', 'admin-staff', 'support-staff'
    class: '',
    section: ''
  });

  // State for dropdown options
  const [userTypes, setUserTypes] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch user types on component mount
  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        setLoadingOptions(true);
        const res = await axios.get('/api/filters/user-types');
        if (res.data.success) {
          setUserTypes(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching user types:', err);
        setError('Failed to load user types: ' + (err.response?.data?.message || err.message || 'Please try again later.'));
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchUserTypes();
  }, []);

  // Fetch available classes when user type changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!filter.userType) return;

      try {
        setLoadingOptions(true);
        setAvailableClasses([]);
        setFilter(prev => ({ ...prev, class: '', section: '' }));

        const res = await axios.get(`/api/filters/classes?userType=${filter.userType}`);
        if (res.data.success) {
          setAvailableClasses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes: ' + (err.response?.data?.message || err.message || 'Please try again later.'));
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchClasses();
  }, [filter.userType]);

  // Fetch available sections when class changes
  useEffect(() => {
    const fetchSections = async () => {
      if (!filter.userType || !filter.class) return;

      try {
        setLoadingOptions(true);
        setAvailableSections([]);
        setFilter(prev => ({ ...prev, section: '' }));

        const res = await axios.get(`/api/filters/sections?userType=${filter.userType}&class=${filter.class}`);
        if (res.data.success) {
          setAvailableSections(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching sections:', err);
        setError('Failed to load sections: ' + (err.response?.data?.message || err.message || 'Please try again later.'));
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchSections();
  }, [filter.userType, filter.class]);

  // Fetch attendance records when filters change
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        console.log('Starting attendance fetch with filters:', filter);
        setLoading(true);
        setError('');

        // Build query string from filter
        const queryParams = new URLSearchParams();

        // Add date filter
        if (filter.date) {
          queryParams.append('date', filter.date);
        }

        // Add user type filter
        if (filter.userType) {
          queryParams.append('userType', filter.userType);
        }

        // Add class and section filters if provided
        if (filter.class) {
          queryParams.append('class', filter.class);
        }

        if (filter.section) {
          queryParams.append('section', filter.section);
        }

        console.log('Fetching attendance with params:', queryParams.toString());
        const res = await axios.get(`/api/attendance?${queryParams.toString()}`);

        console.log('Attendance API response:', res.data);

        if (res.data.success) {
          console.log('Attendance records count:', res.data.data.length);
          setAttendanceRecords(res.data.data);
        } else {
          setError('Failed to load attendance records: ' + (res.data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance records: ' + (err.response?.data?.message || err.message || 'Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [filter.date, filter.userType, filter.class, filter.section]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkAttendance = () => {
    setSelectedRecord(null);
    setShowModal(true);
  };

  const handleEditAttendance = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleAttendanceSuccess = () => {
    // Refresh attendance records after successful submission
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError('');

        // Build query string from filter
        const queryParams = new URLSearchParams();

        // Add date filter
        if (filter.date) {
          queryParams.append('date', filter.date);
        }

        // Add user type filter
        if (filter.userType) {
          queryParams.append('userType', filter.userType);
        }

        // Add class and section filters if provided
        if (filter.class) {
          queryParams.append('class', filter.class);
        }

        if (filter.section) {
          queryParams.append('section', filter.section);
        }

        console.log('Refreshing attendance with params:', queryParams.toString());
        const res = await axios.get(`/api/attendance?${queryParams.toString()}`);

        console.log('Attendance refresh API response:', res.data);

        if (res.data.success) {
          console.log('Refreshed attendance records count:', res.data.data.length);
          setAttendanceRecords(res.data.data);

          // Close the modal if it's open
          if (showModal) {
            setShowModal(false);
            setSelectedRecord(null);
          }
        } else {
          setError('Failed to load attendance records: ' + (res.data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance records: ' + (err.response?.data?.message || err.message || 'Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Attendance Management</h1>
          <div className="flex space-x-2">
            {user && ['admin', 'principal', 'teacher'].includes(user.role) && (
              <button
                onClick={handleMarkAttendance}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Mark Attendance
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                id="date"
                value={filter.date}
                onChange={handleFilterChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">User Type</label>
              <select
                id="userType"
                name="userType"
                value={filter.userType}
                onChange={handleFilterChange}
                disabled={loadingOptions}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {userTypes.length > 0 ? (
                  userTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))
                ) : (
                  <option value="student">Student</option>
                )}
              </select>
            </div>

            {/* Class dropdown - show for student and teacher */}
            {(filter.userType === 'student' || filter.userType === 'teacher') && (
              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700">Class</label>
                <select
                  id="class"
                  name="class"
                  value={filter.class}
                  onChange={handleFilterChange}
                  disabled={loadingOptions || availableClasses.length === 0}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Classes</option>
                  {availableClasses.map(cls => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
                {loadingOptions && (
                  <div className="mt-1 text-xs text-gray-500">Loading classes...</div>
                )}
                {!loadingOptions && availableClasses.length === 0 && (
                  <div className="mt-1 text-xs text-gray-500">No classes available for this user type</div>
                )}
              </div>
            )}

            {/* Section dropdown - only show for students */}
            {filter.userType === 'student' && filter.class && (
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  id="section"
                  name="section"
                  value={filter.section}
                  onChange={handleFilterChange}
                  disabled={loadingOptions || availableSections.length === 0}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Sections</option>
                  {availableSections.map(section => (
                    <option key={section.value} value={section.value}>{section.label}</option>
                  ))}
                </select>
                {loadingOptions && (
                  <div className="mt-1 text-xs text-gray-500">Loading sections...</div>
                )}
                {!loadingOptions && availableSections.length === 0 && (
                  <div className="mt-1 text-xs text-gray-500">No sections available for this class</div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-8 sm:p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filter.userType === 'student' && filter.class && filter.section ? (
                    `No students found in Class ${filter.class} Section ${filter.section} for the selected date.`
                  ) : filter.userType === 'student' && filter.class ? (
                    `No students found in Class ${filter.class} for the selected date.`
                  ) : filter.userType === 'teacher' && filter.class ? (
                    `No teachers found teaching Class ${filter.class} for the selected date.`
                  ) : (
                    `No ${filter.userType.replace('-', ' ')}s found for the selected date.`
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {filter.userType === 'student' ? 'Roll Number / Class' : 'Employee ID / Position'}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorded By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {record.userId?.user?.name?.charAt(0) || record.userType?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.userId?.user?.name || 'Unknown User'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {record.userType === 'student' && record.userId?.rollNumber}
                          {record.userType === 'teacher' && record.userId?.employeeId}
                          {record.userType === 'admin-staff' && record.userId?.employeeId}
                          {record.userType === 'support-staff' && record.userId?.employeeId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.userType === 'student' && record.userId?.class && record.userId?.section &&
                            `Class ${record.userId.class} ${record.userId.section}`}
                          {record.userType === 'teacher' && record.userId?.subjects?.join(', ')}
                          {record.userType === 'admin-staff' && record.userId?.position}
                          {record.userType === 'support-staff' && record.userId?.position}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'half-day' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.recordedBy?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user && ['admin', 'principal', 'teacher'].includes(user.role) && (
                          <button
                            onClick={() => handleEditAttendance(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleAttendanceSuccess}
        attendanceType={filter.userType}
        date={filter.date}
        classFilter={filter.class}
        sectionFilter={filter.section}
        selectedRecord={selectedRecord}
      />
    </div>
  );
};

export default AttendancePage;
