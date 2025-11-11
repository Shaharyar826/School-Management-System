import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import ConfirmationModal from '../common/ConfirmationModal';
import BackButton from '../common/BackButton';

const ViewTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { goBack } = useNavigation();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    console.log('ViewTeacher - Current user:', user);

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        let res;

        // If user is a teacher viewing their own profile, use the profile endpoint
        if (user && user.role === 'teacher' && !id) {
          res = await axios.get('/api/teachers/profile');
        } else {
          res = await axios.get(`/api/teachers/${id}`);
        }

        if (res.data.success) {
          setTeacher(res.data.data);
          console.log('Teacher data loaded:', res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch teacher details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id, user]);

  const handleDeleteClick = () => {
    console.log('Delete button clicked in ViewTeacher');
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/teachers/${id}`);
      setShowDeleteModal(false);
      // Navigate back to teachers list after successful deletion
      navigate('/teachers', {
        state: {
          successMessage: `Teacher ${teacher?.user?.name} has been successfully deleted along with their user account.`
        }
      });
    } catch (err) {
      setError(`Failed to delete teacher: ${err.response?.data?.message || err.message}`);
      setShowDeleteModal(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
          <BackButton
            defaultPath="/teachers"
            label="Back to Teachers"
            className="text-white bg-blue-600 hover:bg-blue-700 border-transparent"
          />
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Teacher not found</p>
              </div>
            </div>
          </div>
          <BackButton
            defaultPath="/teachers"
            label="Back to Teachers"
            className="text-white bg-blue-600 hover:bg-blue-700 border-transparent"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Teacher Details</h1>
          <div className="flex space-x-3">
            <BackButton
              defaultPath="/teachers"
              label="Back"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={() => console.log('Back button clicked')}
            />

            {/* Admin and Principal can edit and delete */}
            {user && (user.role === 'admin' || user.role === 'principal') && (
              <>
                <button
                  onClick={() => {
                    console.log('Edit button clicked in ViewTeacher');
                    navigate(`/teachers/edit/${id}`);
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded ml-2"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    console.log('Delete button clicked in ViewTeacher');
                    handleDeleteClick();
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded ml-2"
                >
                  Delete
                </button>
              </>
            )}

            {/* Teacher can only edit their own profile */}
            {user && user.role === 'teacher' && teacher.user && teacher.user._id && teacher.user._id.toString() === user.id && (
              <button
                onClick={() => {
                  console.log('Teacher editing own profile in ViewTeacher');
                  navigate(`/teachers/edit/${id}`);
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded ml-2"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
              {teacher.user?.profileImage?.url ? (
                <img
                  src={teacher.user.profileImage.url}
                  alt={teacher.user?.name || 'Teacher'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=T';
                  }}
                />
              ) : (
                <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {teacher.user?.name?.charAt(0) || 'T'}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{teacher.user?.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{teacher.employeeId} | {teacher.qualification}</p>
            </div>
            <div className="ml-auto">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {teacher.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacher.user?.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacher.user?.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacher.phoneNumber}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : 'Not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {teacher.gender ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Qualification</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacher.qualification}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Experience</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{teacher.experience} years</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Subjects</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'No subjects assigned'
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Classes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {teacher.classes && teacher.classes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teacher.classes.map((cls, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {cls}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'No classes assigned'
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Joining Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(teacher.joiningDate).toLocaleDateString()}
                </dd>
              </div>
              {(user?.role === 'admin' || user?.role === 'principal' || user?.role === 'accountant') && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Salary</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${teacher.salary.toLocaleString()}
                  </dd>
                </div>
              )}
              {teacher.address && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {teacher.address.street && <div>{teacher.address.street}</div>}
                    {teacher.address.city && teacher.address.state && (
                      <div>
                        {teacher.address.city}, {teacher.address.state} {teacher.address.zipCode}
                      </div>
                    )}
                    {teacher.address.country && <div>{teacher.address.country}</div>}
                    {!teacher.address.street && !teacher.address.city && 'Address not provided'}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Attendance Records Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Records</h2>
          {teacher.attendanceRecords && teacher.attendanceRecords.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  {teacher.attendanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'half-day' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No attendance records found
              </div>
            </div>
          )}
        </div>

        {/* Salary Records Section */}
        {(user?.role === 'admin' || user?.role === 'principal' || user?.role === 'accountant') && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary Records</h2>
            {teacher.salaryRecords && teacher.salaryRecords.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Month
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teacher.salaryRecords.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${record.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.status === 'paid' ? 'bg-green-100 text-green-800' :
                            record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                  No salary records found
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${teacher?.user?.name}? This will also delete their user account and all associated data. This action cannot be undone.`}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
        isDangerous={true}
      />
    </div>
  );
};

export default ViewTeacher;
