function Button({ 
  children, 
  variant = "primary", 
  onClick, 
  disabled = false,
  type = "button",
  className = "",
  ...props 
}) {
  const baseStyles = "flex-1 max-w-[180px] px-6 py-2 rounded-full font-normal transition-colors";
  
  const variants = {
    primary: disabled 
      ? "bg-gray-400 text-gray-500 cursor-not-allowed" 
      : "bg-[#72BFDD] text-white hover:bg-[#5fa8c4]",
    secondary: "border-2 border-gray-400 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
