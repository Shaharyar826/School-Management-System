import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';

const ProcessSalaryPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [salary, setSalary] = useState(null);

  const [paymentData, setPaymentData] = useState({
    status: 'paid',
    paidAmount: 0,
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  useEffect(() => {
    const fetchSalaryRecord = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/salaries/${id}`);

        if (res.data.success) {
          const salaryData = res.data.data;
          setSalary(salaryData);
          
          // Set initial payment data
          setPaymentData({
            status: 'paid',
            paidAmount: calculateNetAmount(salaryData),
            paymentMethod: 'cash',
            transactionId: '',
            remarks: salaryData.remarks || ''
          });
        }
      } catch (err) {
        setError('Failed to fetch salary record. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryRecord();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });

    // If status changes to partial, adjust paidAmount if needed
    if (name === 'status' && value === 'partial' && paymentData.paidAmount === calculateNetAmount(salary)) {
      setPaymentData(prev => ({
        ...prev,
        paidAmount: calculateNetAmount(salary) / 2, // Default to half payment for partial
        [name]: value
      }));
    }

    // If status changes to paid, set paidAmount to full amount
    if (name === 'status' && value === 'paid') {
      setPaymentData(prev => ({
        ...prev,
        paidAmount: calculateNetAmount(salary),
        [name]: value
      }));
    }
  };

  const calculateTotalDeductions = (salaryData) => {
    if (!salaryData || !salaryData.deductions || !salaryData.deductions.length) return 0;
    return salaryData.deductions.reduce((total, deduction) => total + deduction.amount, 0);
  };

  const calculateTotalBonuses = (salaryData) => {
    if (!salaryData || !salaryData.bonuses || !salaryData.bonuses.length) return 0;
    return salaryData.bonuses.reduce((total, bonus) => total + bonus.amount, 0);
  };

  const calculateNetAmount = (salaryData) => {
    if (!salaryData) return 0;
    const baseAmount = salaryData.amount || 0;
    const totalDeductions = calculateTotalDeductions(salaryData);
    const totalBonuses = calculateTotalBonuses(salaryData);
    return baseAmount + totalBonuses - totalDeductions;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStaffName = () => {
    if (!salary) return 'Staff';
    
    if (salary.staffType === 'teacher' && salary.teacher) {
      return salary.teacher.user?.name || 'Unknown Teacher';
    } else if (salary.staffType === 'admin-staff' && salary.adminStaff) {
      return salary.adminStaff.user?.name || 'Unknown Admin Staff';
    } else if (salary.staffType === 'support-staff' && salary.supportStaff) {
      return salary.supportStaff.user?.name || 'Unknown Support Staff';
    }
    return 'Unknown Staff';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Validate payment data
      if (paymentData.status === 'partial' && (!paymentData.paidAmount || paymentData.paidAmount <= 0)) {
        throw new Error('Paid amount must be greater than 0 for partial payment');
      }

      if (paymentData.status === 'partial' && paymentData.paidAmount >= calculateNetAmount(salary)) {
        throw new Error('Partial payment amount must be less than the total amount');
      }

      // Prepare data for update
      const dataToUpdate = {
        ...paymentData,
        paymentDate: new Date(),
        // If payment method is not cash or check, transaction ID is required
        transactionId: paymentData.paymentMethod !== 'cash' && paymentData.paymentMethod !== 'check' 
          ? paymentData.transactionId 
          : paymentData.transactionId || null
      };

      const res = await axios.put(`/api/salaries/${id}`, dataToUpdate);

      if (res.data.success) {
        navigate(`/salaries/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!salary) {
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
                <p className="text-sm text-yellow-700">Salary record not found.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't allow processing if already paid
  if (salary.status === 'paid') {
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
                <p className="text-sm text-yellow-700">This salary has already been paid in full.</p>
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/salaries/${id}`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Salary Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Process Payment for {getStaffName()}</h1>
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

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          {/* Salary Summary */}
          <div className="mb-8 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Summary</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Staff Name</p>
                <p className="text-base font-medium">{getStaffName()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Month</p>
                <p className="text-base font-medium">{salary.month}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Base Amount</p>
                <p className="text-base font-medium">{formatCurrency(salary.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="text-base font-medium capitalize">{salary.status}</p>
              </div>
              {salary.status === 'partial' && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Already Paid</p>
                    <p className="text-base font-medium">{formatCurrency(salary.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Remaining</p>
                    <p className="text-base font-medium">{formatCurrency(calculateNetAmount(salary) - salary.paidAmount)}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-gray-500">Total Deductions</p>
                <p className="text-base font-medium text-red-600">-{formatCurrency(calculateTotalDeductions(salary))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bonuses</p>
                <p className="text-base font-medium text-green-600">+{formatCurrency(calculateTotalBonuses(salary))}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Net Amount</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(calculateNetAmount(salary))}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="status"
                    name="status"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={paymentData.status}
                    onChange={handleChange}
                  >
                    <option value="paid">Paid (Full Payment)</option>
                    <option value="partial">Partial Payment</option>
                  </select>
                  <label
                    htmlFor="status"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${paymentData.status ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={paymentData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank transfer">Bank Transfer</option>
                    <option value="online">Online Payment</option>
                    <option value="other">Other</option>
                  </select>
                  <label
                    htmlFor="paymentMethod"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${paymentData.paymentMethod ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {paymentData.status === 'partial' && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="paidAmount"
                    name="paidAmount"
                    type="number"
                    label="Amount to Pay"
                    required
                    min="0.01"
                    max={calculateNetAmount(salary)}
                    step="0.01"
                    value={paymentData.paidAmount}
                    onChange={handleChange}
                    placeholder="Enter amount to pay"
                  />
                </div>
              )}

              {(paymentData.paymentMethod !== 'cash' && paymentData.paymentMethod !== 'check') && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="transactionId"
                    name="transactionId"
                    type="text"
                    label="Transaction ID"
                    required
                    value={paymentData.transactionId}
                    onChange={handleChange}
                    placeholder="Enter transaction ID"
                  />
                </div>
              )}

              <div className="sm:col-span-6">
                <div className="floating-input-container">
                  <textarea
                    id="remarks"
                    name="remarks"
                    rows="3"
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={paymentData.remarks}
                    onChange={handleChange}
                    placeholder=""
                  ></textarea>
                  <label
                    htmlFor="remarks"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${paymentData.remarks ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Payment Remarks
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/salaries/${id}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProcessSalaryPayment;
