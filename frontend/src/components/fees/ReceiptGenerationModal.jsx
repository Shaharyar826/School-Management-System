import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormInput from '../common/FormInput';
import ReceiptConfirmation from './ReceiptConfirmation';
import { getStudentAbsences, checkExistingFeeRecords } from '../../utils/attendanceUtils';

const ReceiptGenerationModal = ({ isOpen, onClose, student, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [absenceCount, setAbsenceCount] = useState(0);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [suggestedFine, setSuggestedFine] = useState(0);
  const [showFineConfirmation, setShowFineConfirmation] = useState(false);
  const [existingFeeRecords, setExistingFeeRecords] = useState([]);
  const [loadingExistingFees, setLoadingExistingFees] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [receiptData, setReceiptData] = useState({
    student: student?._id || '',
    feeType: 'tuition',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    status: 'unpaid',
    description: `Monthly fee for ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    absenceFine: 0,
    otherAdjustments: 0,
    arrears: 0
  });

  // Function to fetch arrears for a student
  const fetchStudentArrears = async (studentId) => {
    try {
      const response = await axios.get(`/api/fees/arrears/${studentId}`);
      if (response.data.success) {
        return response.data.arrears;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching student arrears:', error);
      return 0;
    }
  };

  useEffect(() => {
    if (isOpen && student) {
      // Set the student ID and default amount from the student's monthly fee
      setReceiptData(prev => ({
        ...prev,
        student: student._id,
        amount: student.monthlyFee || 0
      }));

      // Check for existing fee records for the current month
      checkForExistingFees();

      // Check attendance records for absences
      checkForAbsences();

      // Fetch arrears for this student
      const getArrears = async () => {
        // Always fetch arrears - the backend will handle starting month logic
        const arrears = await fetchStudentArrears(student._id);
        setReceiptData(prev => ({
          ...prev,
          arrears: arrears
        }));
      };

      getArrears();
    }
  }, [isOpen, student]);

  const checkForExistingFees = async () => {
    if (!student) return;

    try {
      setLoadingExistingFees(true);

      const { exists, records } = await checkExistingFeeRecords(student._id);

      if (exists) {
        setExistingFeeRecords(records);
        setShowDuplicateWarning(true);
      } else {
        setShowDuplicateWarning(false);
      }
    } catch (err) {
      console.error('Error checking existing fee records:', err);
    } finally {
      setLoadingExistingFees(false);
    }
  };

  const checkForAbsences = async () => {
    if (!student) return;

    try {
      setLoadingAttendance(true);

      const { absenceCount, suggestedFine, consecutiveMonthNumber, fineDetails } = await getStudentAbsences(student._id);

      setAbsenceCount(absenceCount);

      // Always update the absence fine field, even if it's 0
      setReceiptData(prev => ({
        ...prev,
        absenceFine: suggestedFine
      }));

      if (suggestedFine > 0) {
        setSuggestedFine(suggestedFine);
        setShowFineConfirmation(true);

        // Show enhanced fine details if available
        if (fineDetails && fineDetails.details) {
          console.log('Enhanced absence fine details:', fineDetails.details);
        }
      }
    } catch (err) {
      console.error('Error checking attendance records:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceiptData({
      ...receiptData,
      [name]: value
    });
  };

  const calculateBaseAmount = () => {
    const baseAmount = parseFloat(receiptData.amount) || 0;
    const absenceFine = parseFloat(receiptData.absenceFine) || 0;
    const otherAdjustments = parseFloat(receiptData.otherAdjustments) || 0;

    return baseAmount + absenceFine + otherAdjustments;
  };

  const calculateTotalAmount = () => {
    const baseTotal = calculateBaseAmount();
    const arrears = parseFloat(receiptData.arrears) || 0;

    return baseTotal + arrears;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Show confirmation dialog instead of submitting directly
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Calculate base amount (without arrears)
      const baseTotal = calculateBaseAmount();

      // Prepare data for submission
      const feeData = {
        student: receiptData.student,
        feeType: receiptData.feeType,
        amount: baseTotal, // Only include base amount + fines + adjustments
        monthlyFee: parseFloat(receiptData.amount) || 0,
        absenceFine: parseFloat(receiptData.absenceFine) || 0,
        otherAdjustments: parseFloat(receiptData.otherAdjustments) || 0,
        dueDate: receiptData.dueDate,
        status: 'unpaid',
        description: receiptData.description,
        // Include arrears separately - the backend will handle it correctly
        arrears: parseFloat(receiptData.arrears) || 0
      };

      // Create the fee record (keep as unpaid for later payment processing)
      const res = await axios.post('/api/fees', feeData);

      if (res.data.success) {
        // Generate receipt for the newly created fee
        const feeId = res.data.data._id;
        const receiptRes = await axios.get(`/api/fee-receipts/generate/${feeId}`);

        if (receiptRes.data.success) {
          // Close the modal
          onClose();

          // Call onSuccess to trigger data refresh
          onSuccess('Successfully generated fee receipt');

          // Navigate to view the receipt
          navigate(`/fees/${feeId}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate receipt');
      console.error(err);
      // Hide confirmation dialog on error
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  // Show confirmation dialog if requested
  if (showConfirmation) {
    return (
      <ReceiptConfirmation
        receiptData={receiptData}
        student={student}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirmation}
        loading={loading}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white z-[10000]">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Generate Fee Receipt</h3>

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {showDuplicateWarning && (
            <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              <p>Warning: A fee record already exists for this student for the current month.</p>
              <p>Creating another receipt may result in duplicate charges.</p>
            </div>
          )}

          {showFineConfirmation && (
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <p>Student has {absenceCount} absences this month.</p>
              <p>A suggested fine of Rs.{suggestedFine} has been applied.</p>
              <p>You can adjust this amount below if needed.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="mt-2">
              <FormInput
                id="amount"
                name="amount"
                type="number"
                label="Monthly Fee"
                required
                min="0"
                step="0.01"
                value={receiptData.amount}
                onChange={handleChange}
              />
            </div>

            <div className="mt-2">
              <FormInput
                id="absenceFine"
                name="absenceFine"
                type="number"
                label="Absence Fine"
                min="0"
                step="0.01"
                value={receiptData.absenceFine}
                onChange={handleChange}
              />
            </div>

            <div className="mt-2">
              <FormInput
                id="otherAdjustments"
                name="otherAdjustments"
                type="number"
                label="Other Adjustments"
                step="0.01"
                value={receiptData.otherAdjustments}
                onChange={handleChange}
              />
            </div>

            {receiptData.arrears > 0 && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-red-600">
                  Previous Arrears
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    className="focus:ring-red-500 focus:border-red-500 block w-full pl-3 pr-7 py-2 sm:text-sm border-red-300 rounded-md bg-red-50"
                    value={`Rs.${receiptData.arrears}`}
                    readOnly
                  />
                </div>
                <p className="mt-1 text-xs text-red-500">
                  Unpaid fees from previous months
                </p>
              </div>
            )}

            <div className="mt-2">
              <FormInput
                id="description"
                name="description"
                type="text"
                label="Description"
                required
                value={receiptData.description}
                onChange={handleChange}
              />
            </div>

            <div className="mt-4 bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold">Rs.{calculateTotalAmount()}</span>
              </div>
            </div>

            <div className="items-center gap-2 mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-white text-gray-800 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReceiptGenerationModal;
