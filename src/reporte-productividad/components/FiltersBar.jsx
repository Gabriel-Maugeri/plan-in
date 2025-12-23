import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useFilters } from '../context/FiltersContext';
import { labelsAPI } from '../services/api';
import MultiSelect from './common/MultiSelect';
import Input from './common/Input';
import Button from './common/Button';
import { UNIT_OF_MEASURE } from '../utils/constants';

function FiltersBar({ onSearch }) {
  const {
    selectedLabels,
    startDate,
    endDate,
    unitOfMeasure,
    setSelectedLabels,
    setStartDate,
    setEndDate,
    setUnitOfMeasure,
  } = useFilters();

  const [labels, setLabels] = useState([]);
  const [loadingLabels, setLoadingLabels] = useState(false);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    setLoadingLabels(true);
    try {
      const data = await labelsAPI.getAll();
      
      // Mapear formato del API: {labelId, labelName} a {value, label}
      const labelOptions = data.map(label => ({
        value: label.labelId,
        label: label.labelName,
      }));
      
      setLabels(labelOptions);
      
      // Seleccionar todas las etiquetas por defecto
      const allLabelIds = labelOptions.map(opt => opt.value);
      setSelectedLabels(allLabelIds);
    } catch (error) {
      console.error('Error al cargar etiquetas:', error);
      setLabels([]);
      setSelectedLabels([]);
    } finally {
      setLoadingLabels(false);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  return (
    <div className=" px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        {/* Etiquetas */}
        <div className="flex-1 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Etiquetas
          </label>
          <MultiSelect
            options={labels}
            selectedValues={selectedLabels}
            onChange={setSelectedLabels}
            placeholder="Seleccionar etiquetas"
            allSelectedText="Todos seleccionados"
          />
        </div>

        {/* Fecha Inicio */}
        <div className="flex-1 max-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Fecha Fin */}
        <div className="flex-1 max-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Unidad de Medida */}
        <div className="flex-1 max-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unidad de Medida
          </label>
          <div className="flex gap-2">
            {Object.values(UNIT_OF_MEASURE).map((unit) => (
              <label
                key={unit}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="unitOfMeasure"
                  value={unit}
                  checked={unitOfMeasure === unit}
                  onChange={() => setUnitOfMeasure(unit)}
                  className="w-5 h-5 text-[#72BFDD] focus:ring-[#72BFDD] cursor-pointer"
                />
                <span className="text-sm text-gray-700">{unit}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botón Buscar */}
        <Button
          onClick={handleSearch}
          variant="primary"
          className="px-7 py-4 translate-y-[5px]"
        >
          <Search className="w-4.5 h-4.5" />
          Buscar
        </Button>
      </div>
    </div>
  );
}

export default FiltersBar;
