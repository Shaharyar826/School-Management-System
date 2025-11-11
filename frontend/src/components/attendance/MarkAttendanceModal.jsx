import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../common/FormInput';

const MarkAttendanceModal = ({ isOpen, onClose, onSuccess, attendanceType, date, classFilter, sectionFilter, selectedRecord }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]); // Store today's date for validation
  const [attendanceData, setAttendanceData] = useState({
    date: date || todayDate,
    userType: attendanceType || 'student',
    userId: '',
    status: 'present',
    remarks: ''
  });

  // For batch attendance marking
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // For editing mode
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      if (!selectedRecord) {
        setAttendanceData({
          date: date || todayDate,
          userType: attendanceType || 'student',
          userId: '',
          status: 'present',
          remarks: ''
        });
        setIsEditMode(false);

        // Reset batch mode state
        setIsBatchMode(false);
        setSelectedUserIds([]);
        setSelectAll(false);
      } else {
        // Set form data for editing
        const formattedDate = selectedRecord.date ? new Date(selectedRecord.date).toISOString().split('T')[0] : date;
        setAttendanceData({
          date: formattedDate,
          userType: selectedRecord.userType || attendanceType,
          userId: selectedRecord.userId?._id || selectedRecord.userId || '',
          status: selectedRecord.status || 'present',
          remarks: selectedRecord.remarks || ''
        });
        setIsEditMode(true);

        // Disable batch mode for editing
        setIsBatchMode(false);
        setSelectedUserIds([]);
        setSelectAll(false);
      }

      // Fetch users based on type
      fetchUsers(attendanceType);
    }
  }, [isOpen, attendanceType, classFilter, sectionFilter, selectedRecord, date, todayDate]);

  // Effect to handle select all when users change
  useEffect(() => {
    // If select all is true but users have changed, reselect all users
    if (selectAll && users.length > 0) {
      const allUserIds = users.map(user => user.id);
      setSelectedUserIds(allUserIds);
      console.log('Reselecting all users after users changed:', allUserIds);
    }
  }, [users, selectAll]);

  const fetchUsers = async (userType) => {
    try {
      setLoading(true);
      setUsers([]);

      // Build query params for filtering
      const queryParams = new URLSearchParams();
      queryParams.append('userType', userType);

      // Add class and section filters if provided
      if (classFilter) queryParams.append('class', classFilter);
      if (sectionFilter) queryParams.append('section', sectionFilter);

      // Add date filter to exclude users who already have attendance marked
      if (attendanceData.date) {
        queryParams.append('date', attendanceData.date);
      }

      // If in edit mode, exclude the current attendance record from filtering
      if (isEditMode && selectedRecord && selectedRecord._id) {
        queryParams.append('excludeAttendanceId', selectedRecord._id);
      }

      console.log('Fetching users with params:', queryParams.toString());
      const res = await axios.get(`/api/filters/users?${queryParams.toString()}`);

      if (res.data.success) {
        console.log(`Found ${res.data.count} ${userType}s without attendance for the selected date`);
        console.log('Users available for attendance:', res.data.data);
        setUsers(res.data.data);

        // Reset selected users when the available users change
        setSelectedUserIds([]);
        setSelectAll(false);
      }
    } catch (err) {
      setError(`Failed to fetch ${userType}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAttendanceData({
      ...attendanceData,
      [name]: value
    });
  };

  // Handle toggling batch mode
  const toggleBatchMode = () => {
    const newBatchMode = !isBatchMode;
    setIsBatchMode(newBatchMode);

    // Reset selection state
    setSelectedUserIds([]);
    setSelectAll(false);

    console.log('Toggled batch mode:', newBatchMode);
  };

  // Handle selecting/deselecting all users
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all users
      setSelectedUserIds([]);
      setSelectAll(false);
    } else {
      // Select all users
      const allUserIds = users.map(user => user.id);
      console.log('Selecting all users:', allUserIds);
      setSelectedUserIds(allUserIds);
      setSelectAll(true);
    }
    console.log('Select all toggled, new state:', !selectAll);
  };

  // Handle selecting/deselecting individual user
  const handleSelectUser = (userId) => {
    console.log('Toggling selection for user:', userId);

    let newSelectedIds;
    if (selectedUserIds.includes(userId)) {
      // Deselect the user
      newSelectedIds = selectedUserIds.filter(id => id !== userId);
      setSelectedUserIds(newSelectedIds);
      setSelectAll(false);
    } else {
      // Select the user
      newSelectedIds = [...selectedUserIds, userId];
      setSelectedUserIds(newSelectedIds);

      // Check if all users are now selected
      if (newSelectedIds.length === users.length) {
        setSelectAll(true);
      }
    }

    console.log('Updated selected users:', newSelectedIds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if trying to mark attendance for a past date (for all modes)
      const selectedDate = new Date(attendanceData.date);
      const today = new Date(todayDate);

      // Reset time part for accurate date comparison
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError(`You cannot ${isEditMode ? 'update' : 'mark'} attendance for past dates. Please select today or a future date.`);
        setLoading(false);
        return;
      }

      let res;

      if (isEditMode && selectedRecord) {
        // Update existing record
        const payload = {
          date: attendanceData.date,
          userType: attendanceData.userType,
          userId: attendanceData.userId,
          status: attendanceData.status,
          remarks: attendanceData.remarks
        };

        res = await axios.put(`/api/attendance/${selectedRecord._id}`, payload);
      } else if (isBatchMode && selectedUserIds.length > 0) {
        // Batch create attendance records
        const payload = {
          date: attendanceData.date,
          userType: attendanceData.userType,
          userIds: selectedUserIds,
          status: attendanceData.status,
          remarks: attendanceData.remarks
        };

        res = await axios.post('/api/attendance/batch', payload);
      } else if (!isBatchMode) {
        // Create single attendance record
        const payload = {
          date: attendanceData.date,
          userType: attendanceData.userType,
          userId: attendanceData.userId,
          status: attendanceData.status,
          remarks: attendanceData.remarks
        };

        res = await axios.post('/api/attendance', payload);
      } else {
        setError('Please select at least one user for batch attendance marking');
        setLoading(false);
        return;
      }

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'mark'} attendance`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get user type label
  const getUserTypeLabel = (type) => {
    switch (type) {
      case 'student': return 'Student';
      case 'teacher': return 'Teacher';
      case 'admin-staff': return 'Admin Staff';
      case 'support-staff': return 'Support Staff';
      default: return 'User';
    }
  };

  return createPortal(
    <div className="fixed inset-0 overflow-y-auto" style={{ zIndex: 999999 }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ zIndex: 999999 }}>
          <div className="bg-white px-6 py-5">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditMode ? 'Update' : 'Mark'} {getUserTypeLabel(attendanceType)} Attendance
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-500 text-sm rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    min={todayDate} // Restrict date for all modes
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    value={attendanceData.date}
                    onChange={handleChange}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    You can only {isEditMode ? 'update' : 'mark'} attendance for today or future dates.
                  </p>
                </div>

                {!isEditMode && attendanceType === 'student' && classFilter && (
                  <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-blue-800">
                            Attendance Mode
                          </h3>
                          <p className="mt-1 text-xs text-blue-700">
                            {isBatchMode
                              ? 'Mark attendance for all students in the class at once'
                              : 'Mark attendance for one student at a time'}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-md text-sm font-medium ${!isBatchMode ? 'bg-blue-200 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                            Single
                          </span>
                          <button
                            type="button"
                            onClick={toggleBatchMode}
                            className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{ backgroundColor: isBatchMode ? '#3b82f6' : '#e5e7eb' }}
                          >
                            <span className="sr-only">Toggle batch mode</span>
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isBatchMode ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                          </button>
                          <span className={`px-3 py-1 rounded-md text-sm font-medium ${isBatchMode ? 'bg-blue-200 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600'}`}>
                            Batch
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isEditMode && isBatchMode ? (
                  <div className="mb-4">
                    <div className="bg-white border border-blue-200 rounded-md p-4 mb-4">
                      <h3 className="text-sm font-medium text-gray-800 mb-3">
                        Class Information
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="batchClass" className="block text-sm font-medium text-gray-700 mb-1">
                            Class <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="batchClass"
                            name="batchClass"
                            className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            value={classFilter || ''}
                            disabled={true} // Disabled because we're using the class filter from the parent component
                          >
                            <option value="">{classFilter ? `Class ${classFilter}` : 'Select Class'}</option>
                          </select>
                        </div>

                        {sectionFilter && (
                          <div>
                            <label htmlFor="batchSection" className="block text-sm font-medium text-gray-700 mb-1">
                              Section
                            </label>
                            <select
                              id="batchSection"
                              name="batchSection"
                              className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                              value={sectionFilter || ''}
                              disabled={true} // Disabled because we're using the section filter from the parent component
                            >
                              <option value="">{sectionFilter ? `Section ${sectionFilter}` : 'All Sections'}</option>
                            </select>
                          </div>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        Class and section are selected from the attendance filter. To change, close this modal and update the filters.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Student Selection <span className="text-red-500">*</span>
                        </h3>
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="px-3 py-1 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          {selectAll ? 'Deselect All' : 'Select All Students'}
                        </button>
                      </div>

                      {users.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-md border border-gray-200">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No students available</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            All students already have attendance marked for this date.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between">
                          <div className="mb-3 sm:mb-0">
                            <div className="text-sm text-blue-800 font-medium">
                              {users.length} students available for attendance
                            </div>
                            <p className="text-xs text-blue-700 mt-1">
                              {selectAll
                                ? 'All students are selected'
                                : selectedUserIds.length > 0
                                  ? `${selectedUserIds.length} out of ${users.length} students selected`
                                  : 'No students selected'}
                            </p>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-800 text-xl font-bold border-2 border-blue-300">
                              {selectedUserIds.length}
                            </div>
                            <p className="mt-1 text-xs text-blue-700 font-medium">Students Selected</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  !isEditMode && (
                    <div className="mb-4">
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                        Select {getUserTypeLabel(attendanceType)} <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="userId"
                        name="userId"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                        value={attendanceData.userId}
                        onChange={handleChange}
                      >
                        <option value="">Select {getUserTypeLabel(attendanceType)}</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} - {user.identifier}
                            {user.type === 'student' && ` (Class ${user.class} ${user.section})`}
                            {user.type === 'admin-staff' && ` (${user.position})`}
                            {user.type === 'support-staff' && ` (${user.position})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                )}

                {isEditMode && (
                  <div className="mb-4">
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                      Select {getUserTypeLabel(attendanceType)} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                      value={attendanceData.userId}
                      onChange={handleChange}
                    >
                      <option value="">Select {getUserTypeLabel(attendanceType)}</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.identifier}
                          {user.type === 'student' && ` (Class ${user.class} ${user.section})`}
                          {user.type === 'admin-staff' && ` (${user.position})`}
                          {user.type === 'support-staff' && ` (${user.position})`}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      You can only update attendance status and remarks for today or future dates.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    value={attendanceData.status}
                    onChange={handleChange}
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half-day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    id="remarks"
                    name="remarks"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                    value={attendanceData.remarks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (isBatchMode && selectedUserIds.length === 0)}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isBatchMode && selectedUserIds.length > 0
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } ${isBatchMode && selectedUserIds.length > 0 ? 'py-3 px-6 text-base' : ''}`}
                >
                  {loading
                    ? 'Saving...'
                    : isEditMode
                      ? 'Update Attendance'
                      : isBatchMode
                        ? selectedUserIds.length > 0
                          ? `Mark Attendance for ${selectedUserIds.length} Student${selectedUserIds.length !== 1 ? 's' : ''}`
                          : 'Select Students First'
                        : 'Mark Attendance'
                  }
                  {isBatchMode && selectedUserIds.length > 0 && !loading && (
                    <span className="ml-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {selectedUserIds.length}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MarkAttendanceModal;
