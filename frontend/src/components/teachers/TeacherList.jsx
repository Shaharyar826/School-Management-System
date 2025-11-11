import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import ConfirmationModal from '../common/ConfirmationModal';

const TeacherList = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { navigateToDetail } = useNavigation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    console.log('Current user:', user);
    fetchTeachers();
  }, [currentPage, user]);

  // Check for success message in location state (from ViewTeacher delete)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the location state after reading it
      window.history.replaceState({}, document.title);

      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/teachers?page=${currentPage}&limit=10`);

      if (res.data.success) {
        setTeachers(res.data.data);
        setTotalPages(Math.ceil(res.data.count / 10));
      }
    } catch (err) {
      setError('Failed to fetch teachers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (teacher) => {
    console.log('Delete button clicked for teacher:', teacher);
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/teachers/${selectedTeacher._id}`);
      setShowDeleteModal(false);
      setError('');
      // Show success message
      setSuccessMessage(`Teacher ${selectedTeacher?.user?.name} has been successfully deleted along with their user account.`);
      // Use a temporary state to show success message
      const tempTeachers = teachers.filter(t => t._id !== selectedTeacher._id);
      setTeachers(tempTeachers);
      // Fetch fresh data after deletion
      fetchTeachers();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      setError(`Failed to delete teacher: ${err.response?.data?.message || err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Teachers</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage teacher profiles, subjects, and schedules
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teachers..."
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {user && ['admin', 'principal'].includes(user.role) && (
            <Link
              to="/teachers/add"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Teacher
            </Link>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 mx-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 mx-4">
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

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          No teachers found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subjects
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                        {teacher.user?.profileImage?.url ? (
                          <img
                            src={teacher.user.profileImage.url}
                            alt={teacher.user?.name || 'Teacher'}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.user?.name?.charAt(0) || 'T')}&background=3B82F6&color=fff&size=40`;
                            }}
                          />
                        ) : (
                          <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-bold">
                            {teacher.user?.name?.charAt(0) || 'T'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{teacher.user?.name}</div>
                        <div className="text-sm text-gray-500">{teacher.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.employeeId}</div>
                    <div className="text-sm text-gray-500">Joined: {new Date(teacher.joiningDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {teacher.subjects?.slice(0, 2).join(', ')}
                      {teacher.subjects?.length > 2 && '...'}
                    </div>
                    <div className="text-sm text-gray-500">Experience: {teacher.experience} years</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.phoneNumber}</div>
                    <div className="text-sm text-gray-500">{teacher.qualification}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {teacher.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          console.log('View button clicked for teacher:', teacher._id);
                          setSuccessMessage(`View button clicked for teacher: ${teacher._id}`);
                          // Use the context-aware navigation
                          navigateToDetail(`/teachers/${teacher._id}`, {
                            fromTeacherList: true,
                            teacherId: teacher._id
                          });
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                      >
                        View
                      </button>

                      {/* Admin and Principal can edit and delete any teacher */}
                      {user && ['admin', 'principal'].includes(user.role) && (
                        <>
                          <button
                            onClick={() => {
                              console.log('Edit button clicked for teacher:', teacher._id);
                              setSuccessMessage(`Edit button clicked for teacher: ${teacher._id}`);
                              navigate(`/teachers/edit/${teacher._id}`);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              console.log('Delete button clicked for teacher:', teacher._id);
                              setSuccessMessage(`Delete button clicked for teacher: ${teacher._id}`);
                              handleDeleteClick(teacher);
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                          >
                            Delete
                          </button>
                        </>
                      )}

                      {/* Teacher can only edit their own profile */}
                      {user && user.role === 'teacher' && teacher.user && teacher.user._id && teacher.user._id.toString() === user.id && (
                        <button
                          onClick={() => {
                            console.log('Teacher editing own profile:', teacher._id);
                            setSuccessMessage(`Teacher editing own profile: ${teacher._id}`);
                            navigate(`/teachers/edit/${teacher._id}`);
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, teachers.length)}</span> of{' '}
                <span className="font-medium">{teachers.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${selectedTeacher?.user?.name}? This will also delete their user account and all associated data. This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        isDangerous={true}
      />
    </div>
  );
};

export default TeacherList;
