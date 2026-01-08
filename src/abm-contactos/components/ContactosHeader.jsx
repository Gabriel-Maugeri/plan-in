import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddContactModal, { useContacts } from './AddContactModal';
import { ChevronLeft, CirclePlus, User, X } from 'lucide-react';

function ContactosHeader() {
    const { logout } = useAuth();
    const { addContact } = useContacts();
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
        }
    };

    return (
        <>
            <div className="flex justify-between relative border-b border-b-[#E0E0E0] px-6 py-2 items-center">
                <button><ChevronLeft/></button>
                <h1 className="text-xl font-medium absolute left-1/2 -translate-x-1/2">Contactos</h1>
                <div className="flex gap-12 items-center">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowAddContactModal(true)}
                            className="flex items-center bg-[#72BFDD] rounded-full px-6 py-2 text-white text-base hover:bg-[#5fa8c4]"
                        >
                            <CirclePlus className="mr-2"/>Agregar Contacto
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleLogout}
                            className="hover:bg-gray-100 p-2 rounded-full"
                            title="Cerrar sesión"
                        >
                            <X className='w-5 h-5'></X>
                        </button>
                    </div>
                </div>
            </div>
            
            <AddContactModal 
                isOpen={showAddContactModal} 
                onClose={() => setShowAddContactModal(false)}
            />
        </>
    );
}

export default ContactosHeader;
