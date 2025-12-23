function Input({ 
  type = "text", 
  placeholder, 
  value, 
  onChange, 
  onBlur,
  error,
  className = "",
  ...props 
}) {
  // Para inputs de fecha, usar tipo text cuando está vacío para mostrar placeholder
  const getInputType = () => {
    if (type === 'date' && !value) {
      return 'text';
    }
    return type;
  };

  const getPlaceholder = () => {
    if (type === 'date' && !value) {
      return 'dd/mm/aaaa';
    }
    return placeholder;
  };

  const handleFocus = (e) => {
    if (type === 'date' && !value) {
      e.target.type = 'date';
    }
  };

  const handleBlur = (e) => {
    if (type === 'date' && !e.target.value) {
      e.target.type = 'text';
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="w-full">
      <input
        type={getInputType()}
        placeholder={getPlaceholder()}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none ${
          error ? "border-2 border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default Input;
