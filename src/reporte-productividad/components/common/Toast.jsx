import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

function Toast({ message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="bg-[#EDF7ED] text-[#1E4620] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px]">
      <CheckCircle className="w-5 h-5" />
      <span className="flex-1">{message}</span>
    </div>
  );
}

export default Toast;
