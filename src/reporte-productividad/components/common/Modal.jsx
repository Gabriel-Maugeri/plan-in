import { X } from 'lucide-react';

function Modal({ isOpen, onClose, children, title, size = "w-[720px]" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#27353E2E] bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg ${size} max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium">{title}</h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
