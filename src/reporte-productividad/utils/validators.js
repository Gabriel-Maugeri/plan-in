/**
 * Valida que un string no esté vacío
 */
export const validateRequired = (value, fieldName = 'Campo') => {
  if (!value || value.trim() === '') {
    return `${fieldName} es requerido`;
  }
  return null;
};

/**
 * Valida que una fecha sea válida
 */
export const validateDate = (dateString) => {
  if (!dateString) return 'Fecha es requerida';
  
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(dateString)) {
    return 'Formato de fecha inválido (dd/mm/aaaa)';
  }
  
  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return 'Fecha inválida';
  }
  
  return null;
};

/**
 * Valida que la fecha fin sea posterior a la fecha inicio
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  
  const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
  const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
  
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  
  if (start > end) {
    return 'La fecha fin debe ser posterior a la fecha inicio';
  }
  
  return null;
};
