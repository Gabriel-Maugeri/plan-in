import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AddUserModal from './AddUserModal';
import FilterUsersModal from './FilterUsersModal';
import { ChevronLeft, CirclePlus, User, LogOut, X } from 'lucide-react';

function Header() {
    const { logout, user } = useAuth();
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const handleFilterConfirm = (selectedUsers) => {
        console.log('Usuarios seleccionados:', selectedUsers);
    };

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
        }
    };

    return (
        <>
            <div className="flex justify-between relative border-b border-b-[#E0E0E0] px-6 py-2 items-center">
                <button><ChevronLeft/></button>
                <h1 className="text-xl font-medium absolute left-1/2 -translate-x-1/2">Usuarios</h1>
                <div className="flex gap-12 items-center">
                    <div className="flex gap-2">

                    <button 
                        onClick={() => setShowAddUserModal(true)}
                        className="flex items-center bg-[#72BFDD] rounded-full px-6 py-2 text-white text-base hover:bg-[#5fa8c4]"
                    >
                        <CirclePlus className="mr-2"/>Agregar Usuario
                    </button>
                    <button 
                        onClick={() => setShowFilterModal(true)}
                        className="flex items-center border border-[#5B5346] rounded-full px-6 py-2 text-black text-base hover:bg-gray-50"
                    >
                        <User className="mr-2"/>Filtrar Usuarios
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
            
            <AddUserModal 
                isOpen={showAddUserModal} 
                onClose={() => setShowAddUserModal(false)} 
            />
            
            <FilterUsersModal 
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onConfirm={handleFilterConfirm}
            />
        </>
    );
}

export default Header;
