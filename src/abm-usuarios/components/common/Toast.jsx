import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

function Toast({ 
  message, 
  type = "success", 
  isVisible, 
  onClose 
}) {
  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const styles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${styles[type]}`}>
        {icons[type]}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 hover:opacity-80"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default Toast;
