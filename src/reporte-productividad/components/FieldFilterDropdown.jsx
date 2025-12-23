import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

function FieldFilterDropdown({ 
  fieldName, 
  availableValues, 
  selectedValues, 
  onApply, 
  onClose,
  position 
}) {
  const [tempSelected, setTempSelected] = useState(selectedValues || availableValues);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const allSelected = tempSelected.length === availableValues.length;

  const handleToggleAll = () => {
    if (allSelected) {
      setTempSelected([]);
    } else {
      setTempSelected([...availableValues]);
    }
  };

  const handleToggleValue = (value) => {
    if (tempSelected.includes(value)) {
      setTempSelected(tempSelected.filter(v => v !== value));
    } else {
      setTempSelected([...tempSelected, value]);
    }
  };

  const handleApply = () => {
    onApply(fieldName, tempSelected);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64"
      style={{ 
        top: position.top, 
        left: position.left,
        maxHeight: '400px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div className="p-3 border-b border-gray-200 font-semibold text-sm">
        Filtrar: {fieldName}
      </div>

      <div className="p-2 border-b border-gray-200">
        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleToggleAll}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Seleccionar todos</span>
        </label>
      </div>

      <div className="overflow-y-auto max-h-64 p-2">
        {availableValues.map((value) => {
          const isSelected = tempSelected.includes(value);
          const displayValue = value === null || value === undefined || value === '' ? '(Vacío)' : String(value);
          
          return (
            <label
              key={value}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggleValue(value)}
                className="rounded border-gray-300"
              />
              <span className="text-sm flex-1 truncate">{displayValue}</span>
              {isSelected && <Check className="w-4 h-4 text-blue-600" />}
            </label>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-200 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}

export default FieldFilterDropdown;
