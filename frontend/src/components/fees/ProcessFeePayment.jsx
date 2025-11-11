import { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import { useStudentAttendance } from '../../hooks/useAttendance';

const ProcessFeePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fee, setFee] = useState(null);

  const [paymentData, setPaymentData] = useState({
    status: 'paid',
    paidAmount: 0,
    paymentMethod: 'cash',
    transactionId: '',
    remarks: ''
  });

  const [fineAdjustments, setFineAdjustments] = useState({
    absenceFine: 0,
    otherFines: 0,
  });

  const [feeMonth, setFeeMonth] = useState(null);
  const [feeYear, setFeeYear] = useState(null);
  const [studentId, setStudentId] = useState(null);
  
  const { data: attendanceData, isLoading: attendanceLoading } = useStudentAttendance(
    studentId, 
    feeMonth, 
    feeYear
  );
  
  const safeAttendanceData = attendanceData || { absences: 0, fine: 0, excessAbsences: 0, allowedAbsences: 3 };

  useEffect(() => {
    const fetchAggregatedFeeData = async () => {
      try {
        setLoading(true);
        
        const feeRes = await axios.get(`/api/fees/${id}`);
        if (!feeRes.data.success) {
          throw new Error('Fee record not found');
        }
        
        const feeData = feeRes.data.data;
        const currentStudentId = feeData.student._id || feeData.student;
        setStudentId(currentStudentId);
        
        if (feeData.dueDate) {
          const feeDate = new Date(feeData.dueDate);
          setFeeMonth(feeDate.getMonth() + 1);
          setFeeYear(feeDate.getFullYear());
        }
        
        // Get aggregated unpaid fees
        const aggregateRes = await axios.get(`/api/fees/student-aggregate/${currentStudentId}`);
        if (aggregateRes.data.success) {
          const aggregatedData = aggregateRes.data.data;
          
          const combinedFeeData = {
            ...feeData,
            baseAmount: aggregatedData.baseAmount,
            previousArrears: aggregatedData.previousArrears,
            absenceFine: aggregatedData.absenceFines,
            otherAdjustments: aggregatedData.otherFines
          };
          
          setFee(combinedFeeData);
          
          setFineAdjustments({
            absenceFine: aggregatedData.absenceFines,
            otherFines: aggregatedData.otherFines
          });
        } else {
          setFee(feeData);
        }
        
        setPaymentData({
          status: 'paid',
          paidAmount: 0,
          paymentMethod: 'cash',
          transactionId: '',
          remarks: feeData.description || ''
        });
        
      } catch (err) {
        setError('Failed to fetch fee data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregatedFeeData();
  }, [id]);
  
  // Auto-update attendance fine
  const attendanceFine = useMemo(() => {
    if (attendanceLoading) return 0;
    return safeAttendanceData.fine || 0;
  }, [safeAttendanceData.fine, attendanceLoading]);

  useEffect(() => {
    if (attendanceFine !== undefined && attendanceFine !== fineAdjustments.absenceFine) {
      setFineAdjustments(prev => ({
        ...prev,
        absenceFine: attendanceFine
      }));
    }
  }, [attendanceFine]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    if (!fee) return 0;
    return (fee.baseAmount || 0) + (fee.previousArrears || 0) + fineAdjustments.absenceFine + fineAdjustments.otherFines;
  }, [fee, fineAdjustments]);

  // Update payment amount when status changes
  useEffect(() => {
    if (fee && paymentData.status === 'paid' && totalAmount !== paymentData.paidAmount) {
      setPaymentData(prev => ({
        ...prev,
        paidAmount: totalAmount
      }));
    }
  }, [totalAmount, fee, paymentData.status]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'status') {
      if (value === 'paid') {
        setPaymentData(prev => ({
          ...prev,
          status: value,
          paidAmount: totalAmount
        }));
      } else if (value === 'partial') {
        const currentPaidAmount = paymentData.paidAmount;
        const newPaidAmount = currentPaidAmount === totalAmount ? Math.floor(totalAmount / 2) : currentPaidAmount;
        setPaymentData(prev => ({
          ...prev,
          status: value,
          paidAmount: newPaidAmount
        }));
      } else {
        setPaymentData(prev => ({
          ...prev,
          status: value
        }));
      }
    } else {
      setPaymentData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getStudentName = () => {
    if (!fee || !fee.student || !fee.student.user) return 'Student';
    return fee.student.user.name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      if (paymentData.status === 'partial' && (!paymentData.paidAmount || paymentData.paidAmount <= 0)) {
        throw new Error('Paid amount must be greater than 0 for partial payment');
      }

      if (paymentData.status === 'partial' && paymentData.paidAmount >= totalAmount) {
        throw new Error('Partial payment amount must be less than the total amount');
      }

      let finalPaidAmount = paymentData.paidAmount;
      if (paymentData.status === 'paid') {
        finalPaidAmount = totalAmount;
      }

      const currentStudentId = fee.student._id || fee.student;
      
      const aggregatedPaymentData = {
        paidAmount: finalPaidAmount,
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.paymentMethod !== 'cash' && paymentData.paymentMethod !== 'check'
          ? paymentData.transactionId
          : paymentData.transactionId || null,
        remarks: paymentData.remarks,
        absenceFine: fineAdjustments.absenceFine,
        otherAdjustments: fineAdjustments.otherFines
      };

      const res = await axios.put(`/api/fees/process-aggregate-payment/${currentStudentId}`, aggregatedPaymentData);

      if (res.data.success) {
        setTimeout(() => {
          navigate(`/fees`, {
            state: {
              message: `Payment processed successfully. Fee status updated to ${paymentData.status}.`,
              _timestamp: Date.now()
            },
            replace: true
          });
        }, 500);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
      console.error('Error processing payment:', err);
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

  if (fee.status === 'paid') {
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
                <p className="text-sm text-yellow-700">This fee has already been paid in full.</p>
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/fees`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Fees
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
          <h1 className="text-2xl font-semibold text-gray-900">Process Fee Payment for {getStudentName()}</h1>
        </div>

        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 relative z-20">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Details & Adjustments</h3>
            
            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 mb-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Student:</span>
                <span className="ml-2 text-sm text-gray-900">{getStudentName()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fee Type:</span>
                <span className="ml-2 text-sm text-gray-900">{fee.feeType?.charAt(0).toUpperCase() + fee.feeType?.slice(1)}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Due Date:</span>
                <span className="ml-2 text-sm text-gray-900">{new Date(fee.dueDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Current Status:</span>
                <span className={`ml-2 text-sm px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                    fee.status === 'partial' ? 'bg-blue-100 text-blue-800' :
                    fee.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}
                >
                  {fee.status?.charAt(0).toUpperCase() + fee.status?.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Fee Breakdown & Adjustments</h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
                <div className="bg-white p-3 rounded border">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee</label>
                  <div className="text-lg font-semibold text-gray-900">₹{(fee.baseAmount || 0).toLocaleString()}</div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Arrears</label>
                  <div className="text-lg font-semibold text-gray-900">₹{(fee.previousArrears || 0).toLocaleString()}</div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <FormInput
                    id="absenceFine"
                    name="absenceFine"
                    type="number"
                    label={`Absence Fine (${safeAttendanceData.absences} absences${safeAttendanceData.absences > 3 ? ', Fine Applied' : ', No Fine'})`}
                    min="0"
                    step="1"
                    value={fineAdjustments.absenceFine}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFineAdjustments(prev => ({...prev, absenceFine: value}));
                    }}
                    placeholder="Auto-calculated based on attendance"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    Rule: Fine of ₹500 if absences > 3 days
                  </div>
                </div>

                <div className="bg-white p-3 rounded border">
                  <FormInput
                    id="otherFines"
                    name="otherFines"
                    type="number"
                    label="Other Fines"
                    min="0"
                    step="1"
                    value={fineAdjustments.otherFines}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setFineAdjustments(prev => ({...prev, otherFines: value}));
                    }}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded border border-blue-200">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Base Monthly Fee:</span>
                    <span>₹{(fee.baseAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Arrears:</span>
                    <span>₹{(fee.previousArrears || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Absence Fine:</span>
                    <span>₹{fineAdjustments.absenceFine.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Fines:</span>
                    <span>₹{fineAdjustments.otherFines.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 text-blue-800">
                    <span>Total Amount Due:</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
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
                    <option value="online">Online Transfer</option>
                    <option value="bank transfer">Bank Transfer</option>
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
                    max={totalAmount}
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
                <FormInput
                  id="remarks"
                  name="remarks"
                  type="text"
                  label="Remarks (Optional)"
                  value={paymentData.remarks}
                  onChange={handleChange}
                  placeholder="Add any additional notes"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => navigate(`/fees`)}
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

export default ProcessFeePayment;