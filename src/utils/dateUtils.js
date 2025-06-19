// Format date to ISO string
const formatDateToISO = (date) => {
    return new Date(date).toISOString();
  };
  
  // Check if date is in the past
  const isPastDate = (date) => {
    return new Date(date) < new Date();
  };
  
  // Get formatted date for display
  const formatDateForDisplay = (date) => {
    return new Date(date).toLocaleString();
  };
  
  // Add specified number of days to a date
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
  
  // Calculate time difference in minutes
  const getMinutesDifference = (date1, date2) => {
    const diffMs = Math.abs(new Date(date1) - new Date(date2));
    return Math.floor(diffMs / (1000 * 60));
  };
  
  module.exports = {
    formatDateToISO,
    isPastDate,
    formatDateForDisplay,
    addDays,
    getMinutesDifference
  };