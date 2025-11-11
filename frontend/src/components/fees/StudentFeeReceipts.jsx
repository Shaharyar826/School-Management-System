import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigation } from '../../context/NavigationContext';
import BackButton from '../common/BackButton';

const StudentFeeReceipts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { goBack } = useNavigation();
  const [student, setStudent] = useState(null);
  const [paidFees, setPaidFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentAndFees = async () => {
      try {
        setLoading(true);
        // Fetch student details
        const studentRes = await axios.get(`/api/students/${id}`);

        if (studentRes.data.success) {
          setStudent(studentRes.data.data);

          // Filter paid fees from the student's fee records
          if (studentRes.data.data.feeRecords && studentRes.data.data.feeRecords.length > 0) {
            const paid = studentRes.data.data.feeRecords.filter(fee => fee.status === 'paid');
            setPaidFees(paid);
          }
        }
      } catch (err) {
        setError('Failed to fetch student details and fee records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndFees();
  }, [id]);

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
            defaultPath={`/students/${id}`}
            label="Back to Student Details"
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
          <h1 className="text-2xl font-semibold text-gray-900">Fee Receipts for {student.user?.name}</h1>
          <BackButton
            defaultPath={`/students/${id}`}
            label="Back to Student Details"
            className="text-white bg-blue-600 hover:bg-blue-700 border-transparent"
          />
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex items-center">
            <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
              {student.user?.profileImage && student.user.profileImage !== 'default-avatar.jpg' && student.user.profileImage.startsWith('http') ? (
                <img
                  src={student.user.profileImage}
                  alt={student.user?.name || 'Student'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150?text=S';
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
          </div>
        </div>

        {/* Fee Receipts Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Paid Fee Records</h2>
          {paidFees.length > 0 ? (
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
                      Payment Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paidFees.map((fee) => (
                    <tr key={fee._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${fee.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {fee.receiptNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/fees/receipt/${fee._id}`}
                          className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-xs font-medium"
                        >
                          View/Generate Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
                No paid fee records found
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeeReceipts;
