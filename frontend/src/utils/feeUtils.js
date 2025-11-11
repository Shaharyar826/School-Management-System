import axios from 'axios';

/**
 * Utility functions for fee management
 */

/**
 * Fetch current arrears for a student with breakdown
 * @param {string} studentId - The student ID
 * @returns {Promise<Object>} - The arrears data with breakdown
 */
export const fetchStudentArrears = async (studentId) => {
  try {
    const response = await axios.get(`/api/fees/arrears/${studentId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return { totalArrears: 0, breakdown: [] };
  } catch (error) {
    return { totalArrears: 0, breakdown: [] };
  }
};

/**
 * Refresh arrears for a specific student
 * @param {string} studentId - The student ID
 * @returns {Promise<Object>} - The refresh result
 */
export const refreshStudentArrears = async (studentId) => {
  try {
    const response = await axios.put(`/api/fees/refresh-arrears/${studentId}`);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error refreshing student arrears:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to refresh arrears',
      error: error.message
    };
  }
};

/**
 * Refresh arrears for all students
 * @returns {Promise<Object>} - The refresh result
 */
export const refreshAllArrears = async () => {
  try {
    const response = await axios.put('/api/fees/refresh-all-arrears');
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error refreshing all arrears:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to refresh all arrears',
      error: error.message
    };
  }
};

/**
 * Calculate total amount including arrears
 * @param {Object} fee - The fee object
 * @returns {number} - Total amount
 */
export const calculateTotalAmount = (fee) => {
  if (!fee) return 0;
  return (fee.amount || 0) + (fee.arrears || 0);
};

/**
 * Format currency amount for display
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount || 0);
};

/**
 * Get fee status badge class for styling
 * @param {string} status - The fee status
 * @returns {string} - CSS class string
 */
export const getStatusBadgeClass = (status) => {
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

/**
 * Check if a fee is overdue (only after the last date of the month has passed)
 * @param {string|Date} dueDate - The due date
 * @param {Date} currentDate - Current date (for performance)
 * @returns {boolean} - True if overdue
 */
export const isOverdue = (dueDate, currentDate = new Date()) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  // Set time to end of day for due date to ensure overdue calculation is accurate
  due.setHours(23, 59, 59, 999);
  return due < currentDate;
};

/**
 * Get days until due date
 * @param {string|Date} dueDate - The due date
 * @param {Date} currentDate - Current date (for performance)
 * @returns {number} - Days until due (negative if overdue)
 */
export const getDaysUntilDue = (dueDate, currentDate = new Date()) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const diffTime = due.getTime() - currentDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Generate monthly fees for all students
 * @param {Object} data - Generation parameters
 * @returns {Promise<Object>} - Generation result
 */
export const generateMonthlyFees = async (data = {}) => {
  try {
    const response = await axios.post('/api/fees/generate-monthly', data);
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to generate monthly fees',
      error: error.message
    };
  }
};

/**
 * Get fee history for a student
 * @param {string} studentId - The student ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - Fee history data
 */
export const getFeeHistory = async (studentId, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(`/api/fees/history/${studentId}?${queryParams}`);
    return {
      success: response.data.success,
      data: response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch fee history',
      error: error.message
    };
  }
};

/**
 * Get the last date of a given month
 * @param {number} year - The year
 * @param {number} month - The month (0-11, where 0 is January)
 * @returns {Date} - Date object representing the last date of the month
 */
export const getLastDateOfMonth = (year, month) => {
  return new Date(year, month + 1, 0);
};

/**
 * Get the last date of the current month
 * @returns {Date} - Date object representing the last date of current month
 */
export const getLastDateOfCurrentMonth = () => {
  const now = new Date();
  return getLastDateOfMonth(now.getFullYear(), now.getMonth());
};

/**
 * Get the last date of a specific month for a given date
 * @param {Date} date - The date to get the month's last date for
 * @returns {Date} - Date object representing the last date of that month
 */
export const getLastDateOfMonthForDate = (date) => {
  const targetDate = new Date(date);
  return getLastDateOfMonth(targetDate.getFullYear(), targetDate.getMonth());
};

/**
 * Fix all fee due dates to be last date of month
 * @returns {Promise<Object>} - Fix result
 */
export const fixFeeDueDates = async () => {
  try {
    const response = await axios.put('/api/fees/fix-due-dates');
    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fixing fee due dates:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fix due dates',
      error: error.message
    };
  }
};

/**
 * Get due date status message and styling
 * @param {string|Date} dueDate - The due date
 * @returns {Object} - Status object with message and className
 */
export const getFeeDueDateStatus = (dueDate) => {
  if (!dueDate) return { message: '', className: '' };

  const daysUntilDue = getDaysUntilDue(dueDate);

  if (daysUntilDue < 0) {
    return {
      message: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`,
      className: 'text-red-600 font-semibold'
    };
  } else if (daysUntilDue === 0) {
    return {
      message: 'Due today',
      className: 'text-yellow-600 font-semibold'
    };
  } else if (daysUntilDue <= 3) {
    return {
      message: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
      className: 'text-orange-600 font-semibold'
    };
  } else if (daysUntilDue <= 7) {
    return {
      message: `Due in ${daysUntilDue} days`,
      className: 'text-blue-600'
    };
  } else {
    return {
      message: `Due in ${daysUntilDue} days`,
      className: 'text-gray-600'
    };
  }
};
