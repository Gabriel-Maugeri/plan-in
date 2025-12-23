import * as XLSX from 'xlsx';

/**
 * Exporta datos de la tabla pivote a Excel
 * @param {Array} data - Datos de la tabla
 * @param {Object} pivotConfig - Configuración actual del pivote (rows, cols)
 * @param {string} fileName - Nombre del archivo (sin extensión)
 */
export const exportToExcel = (data, pivotConfig = {}, fileName = 'Reporte_Productividad') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Productividad');
    
    const excelFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, excelFileName);
    
    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    return false;
  }
};

/**
 * Exporta tabla pivote con formato preservado
 * @param {HTMLElement} pivotTable - Elemento HTML de la tabla pivote
 * @param {string} fileName - Nombre del archivo
 */
export const exportPivotTableToExcel = (pivotTable, fileName = 'Tabla_Dinamica') => {
  try {
    const table = pivotTable.querySelector('.pvtTable');
    if (!table) {
      console.error('No se encontró la tabla pivote');
      return false;
    }
    
    const worksheet = XLSX.utils.table_to_sheet(table);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tabla Dinámica');
    
    const excelFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    XLSX.writeFile(workbook, excelFileName);
    
    return true;
  } catch (error) {
    console.error('Error al exportar tabla pivote:', error);
    return false;
  }
};
