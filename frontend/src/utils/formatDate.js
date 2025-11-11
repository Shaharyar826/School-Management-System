/**
 * Format a date string to a human-readable format
 * @param {string} dateString - The date string to format
 * @param {Object} options - Options for date formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Date(dateString).toLocaleDateString(undefined, formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString || 'Invalid date';
  }
};

/**
 * Format a date string to show only date (no time)
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (dateString) => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: undefined,
    minute: undefined
  });
};

/**
 * Format a time string (HH:MM) to a more readable format
 * @param {string} timeString - Time string in format "HH:MM"
 * @returns {string} Formatted time string
 */
export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    // Create a date object with the time
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};
