import { Search } from "lucide-react";

function SearchInput({ 
  placeholder = "Buscar", 
  value, 
  onChange, 
  className = "" 
}) {
  return (
    <div className={`flex items-center gap-2 bg-white border border-[#0000001F] rounded px-3 py-2 ${className}`}>
      <Search className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="outline-none text-sm flex-1"
      />
    </div>
  );
}

export default SearchInput;
