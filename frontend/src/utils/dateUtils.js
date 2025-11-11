// Utility functions for consistent date handling across the application

/**
 * Format a date for display in DD/MM/YYYY format
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateForDisplay = (date) => {
  if (!date) return 'Not specified';
  
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date for input fields (YYYY-MM-DD format)
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string for input fields
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Parse a date string and return a Date object
 * @param {string} dateString - The date string to parse
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Check if a date is valid
 * @param {string|Date} date - The date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  } catch (error) {
    return false;
  }
};