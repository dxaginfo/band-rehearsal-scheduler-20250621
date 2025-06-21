import { format, parseISO, formatDistance } from 'date-fns';

/**
 * Format a date string to a readable format
 * @param {string} dateStr - Date string in ISO format
 * @param {string} formatStr - Format string (default: 'MMM d, yyyy')
 * @returns {string} Formatted date
 */
export const formatDate = (dateStr, formatStr = 'MMM d, yyyy') => {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
};

/**
 * Format a time string (HH:MM:SS) to a readable format (HH:MM AM/PM)
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {string} Formatted time
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    // Create a date object with the time
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeStr;
  }
};

/**
 * Format a date to relative time (e.g., "2 days ago")
 * @param {string} dateStr - Date string in ISO format
 * @returns {string} Relative time
 */
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    return formatDistance(parseISO(dateStr), new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return dateStr;
  }
};

/**
 * Format a date and time string
 * @param {string} dateTimeStr - Date and time string in ISO format
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  try {
    return format(parseISO(dateTimeStr), 'MMM d, yyyy h:mm a');
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateTimeStr;
  }
};

/**
 * Get day name from date
 * @param {string} dateStr - Date string in ISO format
 * @returns {string} Day name
 */
export const getDayName = (dateStr) => {
  if (!dateStr) return '';
  try {
    return format(parseISO(dateStr), 'EEEE');
  } catch (error) {
    console.error('Error getting day name:', error);
    return '';
  }
};

/**
 * Check if a date is in the past
 * @param {string} dateStr - Date string in ISO format
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (dateStr) => {
  if (!dateStr) return false;
  try {
    return parseISO(dateStr) < new Date();
  } catch (error) {
    console.error('Error checking if date is in the past:', error);
    return false;
  }
};

/**
 * Format a duration in minutes to a readable format (e.g., "2h 30m")
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};