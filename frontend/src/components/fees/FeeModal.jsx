import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormInput from '../common/FormInput';

const FeeModal = ({ isOpen, onClose, student, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtherFeeField, setShowOtherFeeField] = useState(false);
  const [paidFees, setPaidFees] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);

  const [feeData, setFeeData] = useState({
    student: student?._id || '',
    feeType: '',
    otherFeeType: '',
    amount: '',
    dueDate: '',
    status: 'unpaid',
    description: ''
  });

  // Fetch student's paid fee records
  const fetchPaidFees = async () => {
    if (!student || !student._id) {
      console.log('No student or student ID available for fetching paid fees');
      return;
    }

    try {
      console.log('Fetching paid fees for student:', student._id);
      setLoadingFees(true);

      // Fetch fee records for this student
      const params = new URLSearchParams();
      params.append('studentId', student._id);

      // The status parameter is passed directly to the MongoDB query
      // so we can use it directly
      params.append('status', 'paid');

      // Add a timestamp to prevent caching
      params.append('_t', Date.now());

      console.log('Fetching fees with params:', params.toString());
      const res = await axios.get(`/api/fees?${params.toString()}`);

      if (res.data.success) {
        console.log('Paid fees fetched successfully:', res.data.data);
        setPaidFees(res.data.data);
      } else {
        console.log('Failed to fetch paid fees:', res.data.message);
      }
    } catch (err) {
      console.error('Error fetching paid fees:', err);
    } finally {
      setLoadingFees(false);
    }
  };

  // Update student ID when student prop changes and fetch paid fees
  useEffect(() => {
    console.log('Student prop changed:', student);
    if (student) {
      console.log('Setting student ID in fee data:', student._id);
      setFeeData(prev => ({
        ...prev,
        student: student._id
      }));

      // Fetch paid fees when the modal opens
      console.log('Calling fetchPaidFees for student:', student._id);
      fetchPaidFees();
    }
  }, [student]);

  // Debug paid fees state changes
  useEffect(() => {
    console.log('paidFees state updated:', paidFees);
  }, [paidFees]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'feeType') {
      // Check if "other" is selected to show the custom fee type field
      setShowOtherFeeField(value === 'other');
    }

    setFeeData({
      ...feeData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare the fee data
      let dataToSubmit = { ...feeData };

      // Ensure we have the correct student ID format
      if (student && student._id) {
        dataToSubmit.student = student._id;
      }

      // Handle "other" fee type
      if (feeData.feeType === 'other' && feeData.otherFeeType) {
        dataToSubmit.feeType = feeData.otherFeeType.toLowerCase();
      }

      // Remove otherFeeType field before submission
      delete dataToSubmit.otherFeeType;

      // Log the data being submitted for debugging
      console.log('Submitting fee data:', dataToSubmit);

      // Handle "all" fee type
      if (feeData.feeType === 'all') {
        // Create multiple fee records for different fee types
        const feeTypes = ['tuition', 'exam'];
        const createdFees = [];
        let hasError = false;

        for (const feeType of feeTypes) {
          try {
            const feeDataForType = {
              ...dataToSubmit,
              feeType
            };

            const res = await axios.post('/api/fees', feeDataForType);

            if (res.data.success) {
              createdFees.push(res.data.data);
            } else {
              hasError = true;
            }
          } catch (feeErr) {
            hasError = true;
          }
        }

        if (!hasError) {
          // Reset form data
          setFeeData({
            amount: '',
            dueDate: new Date().toISOString().split('T')[0],
            feeType: 'tuition',
            description: ''
          });

          // Close the modal immediately
          onClose();

          // Then call onSuccess to trigger data refresh
          // Always use a consistent message format
          const successMessage = "Successfully added fee record for student";

          onSuccess(successMessage);
        } else {
          setError('Some fee records could not be added. Please try again.');
        }
      } else {
        // Regular single fee type submission
        const res = await axios.post('/api/fees', dataToSubmit);

        if (res.data.success) {
          // Reset form data
          setFeeData({
            amount: '',
            dueDate: new Date().toISOString().split('T')[0],
            feeType: 'tuition',
            description: ''
          });

          // Close the modal immediately
          onClose();

          // Then call onSuccess to trigger data refresh
          onSuccess('Successfully added fee record for student');
        } else {
          setError(res.data.message || 'Failed to add fee record');
        }
      }
    } catch (err) {
      console.error('Error in fee submission:', err);
      setError(err.response?.data?.message || 'Failed to add fee record');
    } finally {
      setLoading(false);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-[9999] flex items-center justify-center" style={{ marginTop: '0' }}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 md:mx-auto mt-20">
        {/* Modal header */}
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900">
            Add Fee Record for {student?.user?.name}
          </h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Student Info (read-only) */}
              <div className="sm:col-span-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {student?.user?.name?.charAt(0) || 'S'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student?.user?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Roll Number: {student?.rollNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        Class: {student?.class} {student?.section}
                      </div>
                      <div className="text-sm text-gray-500">
                        Father's Name: {student?.parentInfo?.fatherName || 'Not available'}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Fee Type */}
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="feeType"
                    name="feeType"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.feeType}
                    onChange={handleChange}
                  >
                    <option value="">Select Fee Type</option>
                    <option value="all">All Types</option>
                    <option value="tuition">Tuition Fee</option>
                    <option value="exam">Examination Fee</option>
                    <option value="transport">Transport Fee</option>
                    <option value="library">Library Fee</option>
                    <option value="laboratory">Laboratory Fee</option>
                    <option value="other">Other</option>
                  </select>
                  <label
                    htmlFor="feeType"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.feeType ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >




                    Fee Type <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Other Fee Type Field (conditionally rendered) */}
              {showOtherFeeField && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="otherFeeType"
                    name="otherFeeType"
                    type="text"
                    label="Specify Fee Type"
                    required
                    value={feeData.otherFeeType}
                    onChange={handleChange}
                    placeholder="Enter fee type name"
                  />
                </div>
              )}

              {/* Amount */}
              <div className="sm:col-span-3">
                <FormInput
                  id="amount"
                  name="amount"
                  type="number"
                  label="Amount"
                  required
                  min="0"
                  step="0.01"
                  value={feeData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </div>

              {/* Due Date */}
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.dueDate}
                    onChange={handleChange}
                    />
                  <label
                    htmlFor="dueDate"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.dueDate ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div className="sm:col-span-3">
                <div className="floating-input-container">
                  <select
                    id="status"
                    name="status"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.status}
                    onChange={handleChange}
                    >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <label
                    htmlFor="status"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.status ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="sm:col-span-6">
                <div className="floating-input-container">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={feeData.description}
                    onChange={handleChange}
                    placeholder=" "
                  />
                  <label
                    htmlFor="description"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${feeData.description ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                      >
                    Description
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-500">Brief description of the fee (optional).</p>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between p-4 mt-4 border-t border-gray-200 rounded-b">
              {/* Left side - View/Generate Receipt Button */}
              <div>
                {loadingFees ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-500">Loading receipts...</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/students/${student._id}/fee-receipts`)}
                    className={`inline-flex items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      paidFees.length > 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                  >
                    {paidFees.length > 0
                      ? `View/Generate Receipts (${paidFees.length})`
                      : 'No Receipts Available'}
                  </button>
                )}
              </div>

              {/* Right side - Cancel and Save buttons */}
              <div className="flex items-center">
                <button
                  type="button"
                  className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeeModal;
