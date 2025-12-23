function Select({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seleccionar",
  className = "",
  ...props 
}) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm mb-2">{label}</label>}
      <div className="relative">
        <select
          value={value || ''}
          onChange={onChange}
          className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="currentColor"
        >
          <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
        </svg>
      </div>
    </div>
  );
}

export default Select;
