import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertCircle className="w-5 h-5 text-orange-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const colors = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-orange-500',
        info: 'border-blue-500'
    };

    return (
        <div className={`flex items-center gap-3 bg-white rounded-lg shadow-lg p-4 border-l-4 ${colors[type]} min-w-[300px] max-w-[500px]`}>
            {icons[type]}
            <span className="flex-1 text-sm">{message}</span>
            <button
                onClick={onClose}
                className="hover:bg-gray-100 p-1 rounded"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export default Toast;
