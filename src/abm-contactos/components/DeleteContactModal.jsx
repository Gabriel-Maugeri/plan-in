import { useToast } from '../../components/ToastContainer';
import { contactsAPI } from '../../services/api';

function DeleteContactModal({ isOpen, onClose, onConfirm, contactData }) {
    const { addToast } = useToast();
    
    if (!isOpen) return null;

    const handleConfirm = async () => {
        try {
            await contactsAPI.delete(contactData.id);
            
            if (onConfirm) {
                await onConfirm(contactData);
            }
            
            addToast('Contacto eliminado correctamente', 'success');
            onClose();
        } catch (error) {
            console.error('Error al eliminar contacto:', error);
            addToast('Error al eliminar el contacto', 'error');
        }
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-[#27353E2E] z-40 flex items-center justify-center"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl px-13.5 py-9.5 z-50 w-[532px] shadow-2xl">
                <h2 className="text-3xl font-normal mb-4">Eliminar Contacto</h2>
                <p className="text-gray-700 mb-6">
                    Estás seguro de eliminar a [{contactData?.nombreApellido}] como contacto? Se eliminará de todos los clientes en los que está asociado.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-6 py-2 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
                    >
                        Eliminar contacto
                    </button>
                </div>
            </div>
        </>
    );
}

export default DeleteContactModal;
