import { createContext, useContext, useState } from 'react';
import { UNIT_OF_MEASURE } from '../utils/constants';

const FiltersContext = createContext(null);

export const FiltersProvider = ({ children }) => {
  // Filtros disponibles
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState(UNIT_OF_MEASURE.MINUTES);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Resetea todos los filtros a sus valores por defecto
   */
  const resetFilters = () => {
    setSelectedLabels([]);
    setStartDate('');
    setEndDate('');
    setUnitOfMeasure(UNIT_OF_MEASURE.MINUTES);
    setSearchTerm('');
  };

  /**
   * Actualiza múltiples filtros a la vez
   */
  const updateFilters = (filters) => {
    if (filters.labels !== undefined) setSelectedLabels(filters.labels);
    if (filters.startDate !== undefined) setStartDate(filters.startDate);
    if (filters.endDate !== undefined) setEndDate(filters.endDate);
    if (filters.unitOfMeasure !== undefined) setUnitOfMeasure(filters.unitOfMeasure);
    if (filters.searchTerm !== undefined) setSearchTerm(filters.searchTerm);
  };

  /**
   * Obtiene el objeto de filtros para enviar al API
   * Formato esperado por el endpoint /reports/productidad
   */
  const getFiltersForAPI = () => {
    const filters = {
      labelIds: selectedLabels,
      fromDay: startDate,
      toDay: endDate,
    };
    
    return filters;
  };

  const value = {
    // Estado
    selectedLabels,
    startDate,
    endDate,
    unitOfMeasure,
    searchTerm,
    // Setters individuales
    setSelectedLabels,
    setStartDate,
    setEndDate,
    setUnitOfMeasure,
    setSearchTerm,
    // Acciones
    resetFilters,
    updateFilters,
    getFiltersForAPI,
  };

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters debe ser usado dentro de un FiltersProvider');
  }
  return context;
};
