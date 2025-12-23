import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Button from './Button';

function MultiSelect({ 
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Seleccionar",
  label,
  allSelectedText = "Todos seleccionados",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setTempSelected([...selectedValues]);
    setIsOpen(true);
  };

  const handleToggle = (value) => {
    const newSelected = tempSelected.includes(value)
      ? tempSelected.filter(v => v !== value)
      : [...tempSelected, value];
    setTempSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (tempSelected.length === options.length) {
      setTempSelected([]);
    } else {
      setTempSelected(options.map(opt => opt.value));
    }
  };

  const handleApply = () => {
    onChange(tempSelected);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelected([...selectedValues]);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === options.length) return allSelectedText;
    
    const selected = options.filter(opt => selectedValues.includes(opt.value));
    if (selected.length <= 2) {
      return selected.map(opt => opt.label).join(', ');
    }
    return `${selected.length} seleccionados`;
  };

  const allSelected = tempSelected.length === options.length;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={handleOpen}
        className="w-full px-4 py-3 rounded-lg text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className={`truncate ${selectedValues.length === 0 ? 'text-gray-500' : ''}`}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg">
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
            {/* Checkbox Seleccionar Todos */}
            <label
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 rounded cursor-pointer border-b border-gray-200 mb-2 font-semibold"
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 text-[#72BFDD] cursor-pointer"
              />
              <span>Seleccionar todos</span>
            </label>

            {/* Opciones individuales */}
            {options.map((option) => {
              const isSelected = tempSelected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.value)}
                    className="w-5 h-5 text-[#72BFDD] focus:ring-[#72BFDD] cursor-pointer"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
          
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              variant="primary"
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
