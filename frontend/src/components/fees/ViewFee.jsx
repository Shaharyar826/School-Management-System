import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const ViewFee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeeRecord = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/fees/${id}`);

        if (res.data.success) {
          setFee(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch fee record. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeRecord();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotalAmount = () => {
    if (!fee) return 0;

    // Calculate total amount: base amount + arrears
    // The fee.amount contains the base fee (monthly fee + absence fine + adjustments)
    // The fee.arrears contains any previous unpaid amounts
    const baseAmount = parseFloat(fee.amount) || 0;
    const arrears = parseFloat(fee.arrears) || 0;

    return baseAmount + arrears;
  };



  const getStudentName = () => {
    if (!fee || !fee.student || !fee.student.user) return 'Student';
    return fee.student.user.name;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!fee) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Fee record not found.</p>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Fee Record Details</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/fees')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Fees
            </button>
            <div className="flex space-x-3">
              {user && ['admin', 'principal', 'accountant'].includes(user.role) && fee.status !== 'paid' && (
                <Link
                  to={`/fees/process-payment/${id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Process Payment
                </Link>
              )}
              <Link
                to={`/fees/receipt/${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                View/Generate Receipt
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Fee Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details for the fee record of {getStudentName()}.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {getStudentName()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Fee Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {fee.feeType.charAt(0).toUpperCase() + fee.feeType.slice(1)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Current Month Fee</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Base Monthly Fee:</span>
                      <span>{formatCurrency(fee.monthlyFee || fee.amount)}</span>
                    </div>
                    {fee.absenceFine > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Absence Fine:</span>
                        <span>{formatCurrency(fee.absenceFine)}</span>
                      </div>
                    )}
                    {fee.otherAdjustments > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Other Adjustments:</span>
                        <span>{formatCurrency(fee.otherAdjustments)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Current Month Total:</span>
                      <span>{formatCurrency((fee.monthlyFee || fee.amount) + (fee.absenceFine || 0) + (fee.otherAdjustments || 0))}</span>
                    </div>
                  </div>
                </dd>
              </div>
              {fee.arrears && fee.arrears > 0 && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Previous Arrears</dt>
                  <dd className="mt-1 text-sm text-red-600 font-medium sm:mt-0 sm:col-span-2">
                    {formatCurrency(fee.arrears)}
                  </dd>
                </div>
              )}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total Amount Due</dt>
                <dd className="mt-1 text-lg font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatCurrency(calculateTotalAmount())}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(fee.dueDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(fee.status)}`}>
                    {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                  </span>
                </dd>
              </div>
              {fee.paidAmount > 0 && (
                <>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Paid Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatCurrency(fee.paidAmount)}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Remaining Amount</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatCurrency(fee.remainingAmount || 0)}
                    </dd>
                  </div>
                </>
              )}
              {fee.paymentDate && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {new Date(fee.paymentDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {fee.paymentMethod && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fee.paymentMethod.charAt(0).toUpperCase() + fee.paymentMethod.slice(1)}
                  </dd>
                </div>
              )}
              {fee.transactionId && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fee.transactionId}
                  </dd>
                </div>
              )}
              {fee.description && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {fee.description}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFee;
