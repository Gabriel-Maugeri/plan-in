/**
 * Formatea una fecha a dd/mm/aaaa
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Parsea una fecha en formato dd/mm/aaaa
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/');
  return new Date(year, month - 1, day);
};

/**
 * Obtiene la fecha de hoy en formato ISO
 */
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Convierte fecha dd/mm/aaaa a formato ISO para API
 */
export const dateToISO = (dateString) => {
  if (!dateString) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};
