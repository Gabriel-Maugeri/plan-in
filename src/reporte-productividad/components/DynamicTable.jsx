import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import TableRenderers from 'react-pivottable/TableRenderers';
import { reportsAPI } from '../services/api';
import { useFilters } from '../context/FiltersContext';
import { useViews } from '../context/ViewsContext';
import { PIVOT_CONFIG, PRODUCTIVITY_FIELDS } from '../utils/constants';
import FieldFilterDropdown from './FieldFilterDropdown';

const DynamicTable = forwardRef(({ onPivotChange: onPivotChangeCallback }, ref) => {
  const { getFiltersForAPI, unitOfMeasure } = useFilters();
  const { currentView, updateView } = useViews();
  const pivotTableRef = useRef(null);
  const isProgrammaticChange = useRef(false);
  
  // Inicializar con estructura vacía usando los campos predefinidos
  const emptyDataStructure = PRODUCTIVITY_FIELDS.reduce((acc, field) => {
    acc[field] = null;
    return acc;
  }, {});
  
  const [rawData, setRawData] = useState([emptyDataStructure]);
  const [data, setData] = useState([emptyDataStructure]);
  const [loading, setLoading] = useState(false);
  const [fieldFilters, setFieldFilters] = useState({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState(null);
  const [pivotState, setPivotState] = useState({
    data: [emptyDataStructure],
    rows: currentView?.rows || [],
    cols: currentView?.cols || [],
    vals: [unitOfMeasure], // Campo a sumar según unidad de medida
    ...PIVOT_CONFIG,
  });

  useEffect(() => {
    // Actualizar estado del pivot cuando cambia la vista actual o la unidad de medida
    // Marcar como cambio programático para no disparar el callback
    if (currentView && data.length > 0) {
      isProgrammaticChange.current = true;
      setPivotState({
        data: data,
        rows: currentView.rows || [],
        cols: currentView.cols || [],
        vals: [unitOfMeasure], // Actualizar campo a sumar
        ...PIVOT_CONFIG,
      });
      // Resetear flag después del render
      setTimeout(() => {
        isProgrammaticChange.current = false;
      }, 0);
    }
  }, [currentView, data, unitOfMeasure]);

  // Modificar estructura DOM de la tabla pivotable
  useEffect(() => {
    const modifyPivotTableStructure = () => {
      const pivotContainer = pivotTableRef.current;
      if (!pivotContainer) return;

      const pvtUi = pivotContainer.querySelector('.pvtUi');
      if (!pvtUi) return;

      const rows = pvtUi.querySelectorAll('tbody > tr');
      if (rows.length < 3) return;

      // 1. Agregar colspan="2" a pvtUnused en la primera fila
      const pvtUnused = rows[0].querySelector('.pvtUnused');
      if (pvtUnused) {
        pvtUnused.setAttribute('colspan', '2');
      }

      // // 2. Mover pvtRows de la fila 3 a la fila 2 y agregar rowspan="2"
      // const pvtRows = rows[2].querySelector('.pvtRows');
      // if (pvtRows) {
      //   // Agregar rowspan="2"
      //   pvtRows.setAttribute('rowspan', '2');
        
      //   // Mover como primer hijo de la fila 2
      //   rows[1].insertBefore(pvtRows, rows[1].firstChild);
      // }
    };

    // Ejecutar modificación después del render
    const timeoutId = setTimeout(modifyPivotTableStructure, 0);
    
    return () => clearTimeout(timeoutId);
  }, [pivotState, data]);

  // Event listener para doble click en pvtAttr (evita conflicto con drag)
  useEffect(() => {
    const handlePvtAttrDblClick = (event) => {
      const pvtAttr = event.target.closest('.pvtAttr');
      if (!pvtAttr) return;

      // Prevenir propagación para evitar conflictos
      event.preventDefault();
      event.stopPropagation();

      // Obtener el nombre del campo del texto del elemento
      const fieldName = pvtAttr.textContent.trim();
      
      // Ignorar clicks en campos que no están en PRODUCTIVITY_FIELDS
      if (!PRODUCTIVITY_FIELDS.includes(fieldName)) return;
      
      // Ignorar Minutos y Horas (ya están ocultos, pero por si acaso)
      if (fieldName === 'Minutos' || fieldName === 'Horas') return;

      // Obtener posición para el dropdown
      const rect = pvtAttr.getBoundingClientRect();
      const position = {
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      };

      // Obtener valores únicos del campo
      const uniqueValues = getUniqueValues(fieldName);
      
      // Valores actualmente seleccionados (todos por defecto)
      const currentSelected = fieldFilters[fieldName] || uniqueValues;

      setActiveFilterDropdown({
        fieldName,
        availableValues: uniqueValues,
        selectedValues: currentSelected,
        position
      });
    };

    // Aplicar estilos visuales a campos con filtros activos
    const applyFilterStyles = () => {
      const pivotContainer = pivotTableRef.current;
      if (!pivotContainer) return;

      const allPvtAttrs = pivotContainer.querySelectorAll('.pvtAttr');
      allPvtAttrs.forEach(pvtAttr => {
        const fieldName = pvtAttr.textContent.trim();
        
        // Remover estilo previo
        pvtAttr.classList.remove('filtered-field');
        
        // Agregar estilo si tiene filtro activo
        if (fieldFilters[fieldName]) {
          pvtAttr.classList.add('filtered-field');
        }
      });
    };

    const pivotContainer = pivotTableRef.current;
    if (pivotContainer) {
      // Usar dblclick en lugar de click para no interferir con drag
      pivotContainer.addEventListener('dblclick', handlePvtAttrDblClick);
      applyFilterStyles();
      
      return () => pivotContainer.removeEventListener('dblclick', handlePvtAttrDblClick);
    }
  }, [rawData, fieldFilters]);

  const handleApplyFilter = (fieldName, selectedValues) => {
    const uniqueValues = getUniqueValues(fieldName);
    
    // Si todos están seleccionados, remover el filtro
    if (selectedValues.length === uniqueValues.length) {
      setFieldFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[fieldName];
        return newFilters;
      });
    } else {
      setFieldFilters(prev => ({
        ...prev,
        [fieldName]: selectedValues
      }));
    }
  };

  // Obtener valores únicos de un campo en los datos
  const getUniqueValues = (fieldName) => {
    const values = new Set();
    rawData.forEach(row => {
      const value = row[fieldName];
      values.add(value);
    });
    return Array.from(values).sort();
  };

  // Filtrar datos según los filtros activos por campo
  useEffect(() => {
    if (rawData.length === 0) {
      setData([emptyDataStructure]);
      return;
    }

    // Si no hay filtros activos, usar todos los datos
    if (Object.keys(fieldFilters).length === 0) {
      setData(rawData);
      return;
    }

    // Aplicar filtros
    const filtered = rawData.filter(row => {
      return Object.entries(fieldFilters).every(([field, selectedValues]) => {
        // Si no hay valores seleccionados para este campo, excluir todo
        if (!selectedValues || selectedValues.length === 0) return false;
        
        // Verificar si el valor del row está en los valores seleccionados
        return selectedValues.includes(row[field]);
      });
    });

    setData(filtered.length > 0 ? filtered : [emptyDataStructure]);
  }, [rawData, fieldFilters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = getFiltersForAPI();
      const response = await reportsAPI.getProductivity(filters);
      
      // Handle new response structure with request and result fields
      const tableData = response.result && response.result.length > 0 ? response.result : [emptyDataStructure];
      setRawData(tableData);
      
      // Return the response so the parent can use request data for filter population
      return response;
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Exponer loadData y pivotState para que puedan ser usados desde el componente padre
  useImperativeHandle(ref, () => ({
    loadData,
    getPivotState: () => pivotState,
  }));

  const handlePivotChange = (newState) => {
    setPivotState(newState);
    // Ya no guardamos automáticamente - el usuario debe presionar "Actualizar Vista"
    
    // Solo notificar si NO es un cambio programático (es cambio del usuario)
    if (!isProgrammaticChange.current && onPivotChangeCallback) {
      onPivotChangeCallback(newState);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6 relative" ref={pivotTableRef}>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      )}
      <PivotTableUI
        data={pivotState.data}
        onChange={handlePivotChange}
        renderers={TableRenderers}
        {...pivotState}
        unusedOrientationCutoff={Infinity}
        hiddenAttributes={['Minutos', 'Horas']}
        hiddenFromDragDrop={['Minutos', 'Horas']}
      />
      
      {/* Dropdown de filtro por campo */}
      {activeFilterDropdown && (
        <FieldFilterDropdown
          fieldName={activeFilterDropdown.fieldName}
          availableValues={activeFilterDropdown.availableValues}
          selectedValues={activeFilterDropdown.selectedValues}
          onApply={handleApplyFilter}
          onClose={() => setActiveFilterDropdown(null)}
          position={activeFilterDropdown.position}
        />
      )}
    </div>
  );
});

export default DynamicTable;
