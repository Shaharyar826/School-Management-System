import axios from 'axios';

/**
 * Calculate enhanced absence fine with consecutive month penalties
 * @param {string} studentId - The ID of the student
 * @param {number} year - The year (e.g., 2025)
 * @param {number} month - The month (1-12)
 * @param {number} absenceCount - Number of absences in the month
 * @returns {Promise<{fineAmount: number, consecutiveMonthNumber: number, details: string}>}
 */
export const calculateEnhancedAbsenceFine = async (studentId, year, month, absenceCount) => {
  try {
    const response = await axios.post('/api/absence-fine/calculate', {
      studentId,
      year,
      month,
      absenceCount
    });

    if (response.data.success) {
      return response.data.data;
    }

    return {
      fineAmount: 0,
      consecutiveMonthNumber: 0,
      details: 'No fine calculated'
    };
  } catch (err) {
    console.error('Error calculating enhanced absence fine:', err);

    // Fallback to basic calculation if API fails
    const BASE_FINE = 500;
    const ALLOWED_ABSENCES = 3;

    if (absenceCount <= ALLOWED_ABSENCES) {
      return {
        fineAmount: 0,
        consecutiveMonthNumber: 0,
        details: `${absenceCount} absences (within allowed limit of ${ALLOWED_ABSENCES})`
      };
    }

    return {
      fineAmount: BASE_FINE,
      consecutiveMonthNumber: 1,
      details: `${absenceCount} absences (exceeds limit) - Base fine applied`
    };
  }
};

/**
 * Get the number of absences for a student in the current month
 * @param {string} studentId - The ID of the student
 * @param {Date} date - Optional date to check (defaults to current month)
 * @returns {Promise<{absenceCount: number, suggestedFine: number}>} - The number of absences and suggested fine
 */
export const getStudentAbsences = async (studentId, date = new Date()) => {
  try {
    // Query for all attendance records for this student
    const res = await axios.get(`/api/attendance?userType=student&userId=${studentId}&limit=1000`);

    if (res.data.success) {
      // Calculate start and end dates for the month
      const year = date.getFullYear();
      const month = date.getMonth(); // JavaScript months are 0-indexed

      // Filter records for the current month on the client side
      const monthlyRecords = res.data.data.filter(record => {
        const recordDate = new Date(record.date);
        const recordYear = recordDate.getFullYear();
        const recordMonth = recordDate.getMonth();

        return recordYear === year && recordMonth === month;
      });

      // Count absences
      const absences = monthlyRecords.filter(record => record.status === 'absent');
      const absenceCount = absences.length;

      // Calculate enhanced absence fine with consecutive month penalties
      const fineCalculation = await calculateEnhancedAbsenceFine(studentId, year, month + 1, absenceCount);

      return {
        absenceCount,
        suggestedFine: fineCalculation.fineAmount,
        consecutiveMonthNumber: fineCalculation.consecutiveMonthNumber,
        fineDetails: fineCalculation
      };
    }

    return {
      absenceCount: 0,
      suggestedFine: 0,
      consecutiveMonthNumber: 0,
      fineDetails: null
    };
  } catch (err) {
    console.error('Error checking attendance records:', err);
    return {
      absenceCount: 0,
      suggestedFine: 0,
      consecutiveMonthNumber: 0,
      fineDetails: null
    };
  }
};

/**
 * Check if a fee record already exists for a student in the current month
 * @param {string} studentId - The ID of the student
 * @param {Date} date - Optional date to check (defaults to current month)
 * @returns {Promise<{exists: boolean, records: Array}>} - Whether a fee record exists and the records
 */
export const checkExistingFeeRecords = async (studentId, date = new Date()) => {
  try {
    // Get the current month and year
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed, API expects 1-indexed

    // Query for existing fee records for this student in the current month
    // FIX: Use studentId as the query parameter name instead of student
    const res = await axios.get(`/api/fees?studentId=${studentId}&month=${month}&year=${year}`);

    if (res.data.success) {
      return {
        exists: res.data.data.length > 0,
        records: res.data.data
      };
    }
    
    return {
      exists: false,
      records: []
    };
  } catch (err) {
    console.error('Error checking existing fee records:', err);
    return {
      exists: false,
      records: []
    };
  }
};
