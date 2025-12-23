function Input({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  error,
  validating,
  className = "",
  ...props 
}) {
  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none ${
          error ? "border-2 border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {validating && (
        <p className="text-gray-500 text-sm mt-1">Validando...</p>
      )}
      {error && !validating && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default Input;
