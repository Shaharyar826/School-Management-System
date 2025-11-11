import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import BackButton from '../common/BackButton';
import { formatDateForDisplay } from '../../utils/dateUtils';

const ViewStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { goBack } = useNavigation();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/students/${id}`);

        if (res.data.success) {
          setStudent(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch student details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/students/${id}`);
        navigate('/students');
      } catch (err) {
        setError('Failed to delete student');
        console.error(err);
      }
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
            defaultPath="/students"
            label="Back to Students"
            className="text-white bg-blue-600 hover:bg-blue-700 border-transparent"
          />
        </div>
      </div>
    );
  }

  if (!student) {
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
                <p className="text-sm text-yellow-700">Student not found</p>
              </div>
            </div>
          </div>
          <BackButton
            defaultPath="/students"
            label="Back to Students"
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
          <h1 className="text-2xl font-semibold text-gray-900">Student Details</h1>
          <div className="flex space-x-3">
            <BackButton
              defaultPath="/students"
              label="Back"
              onClick={() => console.log('Back button clicked')}
            />
            {user && (user.role === 'admin' || user.role === 'principal') && (
              <>
                <Link
                  to={`/students/edit/${id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
              {student.user?.profileImage?.url ? (
                <img
                  src={student.user.profileImage.url}
                  alt={student.user?.name || 'Student'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.user?.name?.charAt(0) || 'S')}&background=0D8ABC&color=fff&size=256`;
                  }}
                />
              ) : (
                <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {student.user?.name?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{student.user?.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Roll Number: {student.rollNumber} | Class: {student.class} {student.section}</p>
            </div>
            <div className="ml-auto">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.user?.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.user?.email}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Roll Number</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{student.rollNumber}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Class & Section</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Class {student.class} - Section {student.section}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateForDisplay(student.dateOfBirth)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'Not specified'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDateForDisplay(student.admissionDate)}
                </dd>
              </div>
              {student.address && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {student.address.street && <div>{student.address.street}</div>}
                    {student.address.city && student.address.state && (
                      <div>
                        {student.address.city}, {student.address.state} {student.address.zipCode}
                      </div>
                    )}
                    {student.address.country && <div>{student.address.country}</div>}
                    {!student.address.street && !student.address.city && 'Address not provided'}
                  </dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Parent Information</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Father's Name:</span> {student.parentInfo.fatherName}
                    </div>
                    <div>
                      <span className="font-medium">Mother's Name:</span> {student.parentInfo.motherName}
                    </div>
                    {student.parentInfo.guardianName && (
                      <div>
                        <span className="font-medium">Guardian's Name:</span> {student.parentInfo.guardianName}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Contact Number:</span> {student.parentInfo.contactNumber}
                    </div>
                    {student.parentInfo.email && (
                      <div>
                        <span className="font-medium">Email:</span> {student.parentInfo.email}
                      </div>
                    )}
                    {student.parentInfo.occupation && (
                      <div>
                        <span className="font-medium">Occupation:</span> {student.parentInfo.occupation}
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Attendance Records Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Records</h2>
          {student.attendanceRecords && student.attendanceRecords.length > 0 ? (
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
                  {student.attendanceRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateForDisplay(record.date)}
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

        {/* Fee Records Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Fee Records</h2>
            {student.feeRecords && student.feeRecords.length > 0 && student.feeRecords.some(record => record.status === 'paid') && (
              <button
                onClick={() => navigate(`/students/${id}/fee-receipts`)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                View All Receipts
              </button>
            )}
          </div>
          {student.feeRecords && student.feeRecords.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {student.feeRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.feeType.charAt(0).toUpperCase() + record.feeType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${record.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateForDisplay(record.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'paid' ? 'bg-green-100 text-green-800' :
                          record.status === 'unpaid' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {record.status === 'paid' && (
                            <Link
                              to={`/fees/receipt/${record._id}`}
                              className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs font-medium"
                            >
                              View/Generate Receipt
                            </Link>
                          )}
                          {(user.role === 'admin' || user.role === 'principal' || user.role === 'accountant') && record.status !== 'paid' && (
                            <Link
                              to={`/fees/process-payment/${record._id}`}
                              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs font-medium"
                            >
                              Process Payment
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No fee records found
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;
