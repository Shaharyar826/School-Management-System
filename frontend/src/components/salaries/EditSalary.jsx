import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';

const EditSalary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [originalSalary, setOriginalSalary] = useState(null);

  const [salaryData, setSalaryData] = useState({
    month: '',
    amount: '',
    status: '',
    paidAmount: 0,
    remarks: '',
    deductions: [],
    bonuses: []
  });

  const [newDeduction, setNewDeduction] = useState({
    reason: '',
    amount: ''
  });

  const [newBonus, setNewBonus] = useState({
    reason: '',
    amount: ''
  });

  useEffect(() => {
    const fetchSalaryRecord = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/salaries/${id}`);

        if (res.data.success) {
          const salary = res.data.data;
          setOriginalSalary(salary);
          
          setSalaryData({
            month: salary.month || '',
            amount: salary.amount || '',
            status: salary.status || 'unpaid',
            paidAmount: salary.paidAmount || 0,
            remarks: salary.remarks || '',
            deductions: salary.deductions || [],
            bonuses: salary.bonuses || []
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
    setSalaryData({
      ...salaryData,
      [name]: value
    });
  };

  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setNewDeduction({
      ...newDeduction,
      [name]: value
    });
  };

  const handleBonusChange = (e) => {
    const { name, value } = e.target;
    setNewBonus({
      ...newBonus,
      [name]: value
    });
  };

  const addDeduction = () => {
    if (newDeduction.reason && newDeduction.amount) {
      setSalaryData({
        ...salaryData,
        deductions: [...salaryData.deductions, { ...newDeduction, amount: Number(newDeduction.amount) }]
      });
      setNewDeduction({ reason: '', amount: '' });
    }
  };

  const removeDeduction = (index) => {
    const updatedDeductions = [...salaryData.deductions];
    updatedDeductions.splice(index, 1);
    setSalaryData({
      ...salaryData,
      deductions: updatedDeductions
    });
  };

  const addBonus = () => {
    if (newBonus.reason && newBonus.amount) {
      setSalaryData({
        ...salaryData,
        bonuses: [...salaryData.bonuses, { ...newBonus, amount: Number(newBonus.amount) }]
      });
      setNewBonus({ reason: '', amount: '' });
    }
  };

  const removeBonus = (index) => {
    const updatedBonuses = [...salaryData.bonuses];
    updatedBonuses.splice(index, 1);
    setSalaryData({
      ...salaryData,
      bonuses: updatedBonuses
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Prepare data for update
      const dataToUpdate = {
        ...salaryData,
        // Keep the original staffType and staff reference
        staffType: originalSalary.staffType,
      };

      // Add the appropriate staff reference based on staffType
      if (originalSalary.staffType === 'teacher') {
        dataToUpdate.teacher = originalSalary.teacher._id;
      } else if (originalSalary.staffType === 'admin-staff') {
        dataToUpdate.adminStaff = originalSalary.adminStaff._id;
      } else if (originalSalary.staffType === 'support-staff') {
        dataToUpdate.supportStaff = originalSalary.supportStaff._id;
      }

      // If status is changed to paid, set payment date to today
      if (originalSalary.status !== 'paid' && dataToUpdate.status === 'paid') {
        dataToUpdate.paymentDate = new Date();
      }

      // If status is partial, ensure paidAmount is set
      if (dataToUpdate.status === 'partial' && (!dataToUpdate.paidAmount || dataToUpdate.paidAmount <= 0)) {
        throw new Error('Paid amount must be greater than 0 for partial payment');
      }

      // If status is paid, set paidAmount to full amount
      if (dataToUpdate.status === 'paid') {
        dataToUpdate.paidAmount = calculateTotal();
      }

      const res = await axios.put(`/api/salaries/${id}`, dataToUpdate);

      if (res.data.success) {
        navigate(`/salaries/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update salary record');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Calculate total after deductions and bonuses
  const calculateTotal = () => {
    const baseAmount = Number(salaryData.amount) || 0;
    const totalDeductions = salaryData.deductions.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalBonuses = salaryData.bonuses.reduce((sum, item) => sum + Number(item.amount), 0);
    return baseAmount + totalBonuses - totalDeductions;
  };

  const getStaffName = () => {
    if (!originalSalary) return 'Staff';
    
    if (originalSalary.staffType === 'teacher' && originalSalary.teacher) {
      return originalSalary.teacher.user?.name || 'Unknown Teacher';
    } else if (originalSalary.staffType === 'admin-staff' && originalSalary.adminStaff) {
      return originalSalary.adminStaff.user?.name || 'Unknown Admin Staff';
    } else if (originalSalary.staffType === 'support-staff' && originalSalary.supportStaff) {
      return originalSalary.supportStaff.user?.name || 'Unknown Support Staff';
    }
    return 'Unknown Staff';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!originalSalary) {
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

  return (
    <div className="py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Salary Record for {getStaffName()}</h1>
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
          <form onSubmit={handleSubmit} className="relative z-30">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <FormInput
                  id="month"
                  name="month"
                  type="text"
                  label="Month (MM/YYYY)"
                  required
                  pattern="^(0[1-9]|1[0-2])\/\d{4}$"
                  value={salaryData.month}
                  onChange={handleChange}
                  placeholder="Enter month (MM/YYYY)"
                />
              </div>

              <div className="sm:col-span-3">
                <FormInput
                  id="amount"
                  name="amount"
                  type="number"
                  label="Base Amount"
                  required
                  min="0"
                  step="0.01"
                  value={salaryData.amount}
                  onChange={handleChange}
                  placeholder="Enter base salary amount"
                />
              </div>

              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deductions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <FormInput
                      id="deductionReason"
                      name="reason"
                      type="text"
                      label="Reason"
                      value={newDeduction.reason}
                      onChange={handleDeductionChange}
                      placeholder="Enter deduction reason"
                    />
                  </div>
                  <div>
                    <FormInput
                      id="deductionAmount"
                      name="amount"
                      type="number"
                      label="Amount"
                      min="0"
                      step="0.01"
                      value={newDeduction.amount}
                      onChange={handleDeductionChange}
                      placeholder="Enter deduction amount"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addDeduction}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Deduction
                    </button>
                  </div>
                </div>

                {salaryData.deductions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Deductions:</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      {salaryData.deductions.map((deduction, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <span className="font-medium">{deduction.reason}</span>
                            <span className="ml-2 text-red-600">-Rs. {deduction.amount}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDeduction(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bonuses</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <FormInput
                      id="bonusReason"
                      name="reason"
                      type="text"
                      label="Reason"
                      value={newBonus.reason}
                      onChange={handleBonusChange}
                      placeholder="Enter bonus reason"
                    />
                  </div>
                  <div>
                    <FormInput
                      id="bonusAmount"
                      name="amount"
                      type="number"
                      label="Amount"
                      min="0"
                      step="0.01"
                      value={newBonus.amount}
                      onChange={handleBonusChange}
                      placeholder="Enter bonus amount"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addBonus}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add Bonus
                    </button>
                  </div>
                </div>

                {salaryData.bonuses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Bonuses:</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      {salaryData.bonuses.map((bonus, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                          <div>
                            <span className="font-medium">{bonus.reason}</span>
                            <span className="ml-2 text-green-600">+Rs. {bonus.amount}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeBonus(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Final Amount:</h3>
                    <span className="text-xl font-bold text-blue-600">Rs. {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-6">
                <div className="floating-input-container">
                  <select
                    id="status"
                    name="status"
                    required
                    className="floating-input peer w-full px-4 py-3 border rounded-md transition-all duration-200 outline-none"
                    value={salaryData.status}
                    onChange={handleChange}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                  </select>
                  <label
                    htmlFor="status"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${salaryData.status ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>

              {(salaryData.status === 'partial') && (
                <div className="sm:col-span-3">
                  <FormInput
                    id="paidAmount"
                    name="paidAmount"
                    type="number"
                    label="Paid Amount"
                    required
                    min="0"
                    max={calculateTotal()}
                    step="0.01"
                    value={salaryData.paidAmount}
                    onChange={handleChange}
                    placeholder="Enter paid amount"
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
                    value={salaryData.remarks}
                    onChange={handleChange}
                    placeholder=""
                  ></textarea>
                  <label
                    htmlFor="remarks"
                    className={`absolute left-4 transition-all duration-200 pointer-events-none
                      ${salaryData.remarks ? 'text-sm text-green-500 -top-2.5 bg-white px-1' : 'text-gray-500 top-3'}`}
                  >
                    Remarks
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
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSalary;
