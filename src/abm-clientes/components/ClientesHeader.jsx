import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, CirclePlus, Download, X } from 'lucide-react';
import AddClientModal from './AddClientModal';
import * as XLSX from 'xlsx';

function ClientesHeader({ tableData = [], labels = [] }) {
    const { logout } = useAuth();
    const [showAddClientModal, setShowAddClientModal] = useState(false);

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            logout();
        }
    };

    const handleExportExcel = () => {
        if (tableData.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const labelsMap = {};
        labels.forEach(label => {
            labelsMap[label.labelId] = label.labelName;
        });

        const exportData = tableData.map(client => {
            const clientLabels = (client.labelIds || [])
                .map(id => labelsMap[id])
                .filter(name => name)
                .join(', ');

            return {
                'ID': client.id,
                'Cliente': client.cliente,
                'CUIT': client.cuit,
                'Tipo Societario': client.tipoSocietarioName,
                'Etiqueta': clientLabels,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
        
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `clientes_${date}.xlsx`);
    };

    return (
        <>
            <div className="flex justify-between relative border-b border-b-[#E0E0E0] px-6 py-2 items-center">
                <button><ChevronLeft/></button>
                <h1 className="text-xl font-medium absolute left-1/2 -translate-x-1/2">Clientes</h1>
                <div className="flex gap-12 items-center">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowAddClientModal(true)}
                            className="flex items-center bg-[#72BFDD] rounded-full px-6 py-2 text-white text-base hover:bg-[#5fa8c4]"
                        >
                            <CirclePlus className="mr-2"/>Agregar Cliente
                        </button>
                        <button 
                            onClick={handleExportExcel}
                            className="flex items-center border border-[#5B5346] rounded-full px-6 py-2 text-black text-base hover:bg-gray-50"
                        >
                            <Download className="mr-2"/>Exportar a Excel
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
            
            <AddClientModal 
                isOpen={showAddClientModal}
                onClose={() => setShowAddClientModal(false)}
            />
        </>
    );
}

export default ClientesHeader;
