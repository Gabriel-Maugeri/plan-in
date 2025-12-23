function Select({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccionar", 
  className = "",
  error,
  ...props 
}) {
  return (
    <div className="w-full">
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none cursor-pointer ${
          error ? "border-2 border-red-500" : ""
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default Select;
