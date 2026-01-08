import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis } from 'lucide-react';
import { useState, useEffect, useRef, memo } from 'react';
import { clientesAPI, labelsAPI, legalEntityTypesAPI } from '../../services/api';
import EditClientModal from './EditClientModal';
import { useToast } from '../../components/ToastContainer';

const LabelBadges = memo(function LabelBadges({ labelIds, labels }) {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(labelIds?.length || 0);

    useEffect(() => {
        const calculateVisibleBadges = () => {
            if (!containerRef.current || !labelIds || labelIds.length === 0) return;

            const container = containerRef.current;
            const containerWidth = container.offsetWidth;
            const gap = 8;
            const plusBadgeWidth = 60;
            let totalWidth = 0;
            let count = 0;

            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.className = 'px-3 py-1 rounded-full text-sm';
            document.body.appendChild(tempDiv);

            for (let i = 0; i < labelIds.length; i++) {
                const label = labels.find(l => l.labelId === labelIds[i]);
                if (!label) continue;
                
                tempDiv.textContent = label.labelName;
                const badgeWidth = tempDiv.offsetWidth + 24;
                
                const neededWidth = totalWidth + badgeWidth + (i > 0 ? gap : 0);
                const willNeedPlusBadge = i < labelIds.length - 1;
                const totalNeededWidth = neededWidth + (willNeedPlusBadge ? gap + plusBadgeWidth : 0);

                if (totalNeededWidth > containerWidth) {
                    break;
                }

                totalWidth = neededWidth;
                count++;
            }

            document.body.removeChild(tempDiv);
            setVisibleCount(Math.max(1, count));
        };

        const timeoutId = setTimeout(calculateVisibleBadges, 0);
        window.addEventListener('resize', calculateVisibleBadges);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateVisibleBadges);
        };
    }, [labelIds, labels]);

    if (!labelIds || labelIds.length === 0) {
        return null;
    }

    return (
        <div ref={containerRef} className="flex gap-2">
            {labelIds.slice(0, visibleCount).map((labelId) => {
                const label = labels.find(l => l.labelId === labelId);
                return label ? (
                    <span 
                        key={labelId}
                        className="px-3 py-1 rounded-full text-sm whitespace-nowrap bg-[#E0E0E0] text-[#424242]"
                    >
                        {label.labelName}
                    </span>
                ) : null;
            })}
            {labelIds.length > visibleCount && (
                <span className="px-3 py-1 rounded-full text-sm whitespace-nowrap bg-[#C5CAE9] text-[#3F51B5]">
                    +{labelIds.length - visibleCount}
                </span>
            )}
        </div>
    );
});

function ClientesTable({ onDataChange, onLabelsChange }) {
    const { addToast } = useToast();
    const [filters, setFilters] = useState({
        id: '',
        cliente: '',
        cuit: '',
        tipoSocietario: 'Todos',
        etiqueta: ''
    });

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null
    });

    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [clients, setClients] = useState([]);
    const [labels, setLabels] = useState([]);
    const [legalEntityTypes, setLegalEntityTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    useEffect(() => {
        fetchClientsAndLabels();
        
        window.addClientToTable = (newClient) => {
            setClients(prev => {
                const updated = [...prev, newClient];
                if (onDataChange) onDataChange(updated);
                return updated;
            });
        };

        return () => {
            delete window.addClientToTable;
        };
    }, [onDataChange]);

    const fetchClientsAndLabels = async () => {
        try {
            setLoading(true);
            const [clientsData, labelsData, legalTypes] = await Promise.all([
                clientesAPI.getAll(),
                labelsAPI.getAll(),
                legalEntityTypesAPI.getAll()
            ]);
            
            setLegalEntityTypes(legalTypes);
            
            const legalTypeMap = {};
            legalTypes.forEach(t => {
                legalTypeMap[t.id] = t.type;
            });
            
            const mappedClients = clientsData.map(client => ({
                id: client.clientId,
                clientId: client.clientId,
                cliente: client.businessName,
                businessName: client.businessName,
                cuit: client.taxIdentification,
                taxIdentification: client.taxIdentification,
                tipoSocietario: client.legalEntityTypeId,
                tipoSocietarioName: legalTypeMap[client.legalEntityTypeId] || client.legalEntityTypeId,
                legalEntityTypeId: client.legalEntityTypeId,
                labelIds: client.labelIds || [],
                fiscalAddress: client.fiscalAddress,
                fiscalJurisdictionId: client.fiscalJurisdictionId,
                legalAddress: client.legalAddress,
                legalJurisdictionId: client.legalJurisdictionId,
                closingMonth: client.closingMonth,
                iibbNumber: client.iibbNumber,
                paymentPlatformId: client.paymentPlatformId,
                portalStatus: client.portalStatus,
                rpcDate: client.rpcDate,
                rpcNumber: client.rpcNumber,
                rutTypeId: client.rutTypeId,
                status: client.status,
                viewFiscalNotification: client.viewFiscalNotification,
                fiscalActivities: client.fiscalActivities || []
            }));
            
            setClients(mappedClients);
            setLabels(labelsData);
            
            if (onDataChange) {
                onDataChange(mappedClients);
            }
            if (onLabelsChange) {
                onLabelsChange(labelsData);
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const data = clients;

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') {
                direction = 'desc';
            } else if (sortConfig.direction === 'desc') {
                direction = null;
            }
        }
        setSortConfig({ key: direction ? key : null, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key || sortConfig.direction === null) {
            return (
                <span className="inline-flex flex-col ml-2 gap-1">
                    <ArrowUpDown className="w-4 h-4"/>
                </span>
            );
        }
        if (sortConfig.direction === 'desc') {
            return (
                <span className="inline-flex ml-2">
                    <ArrowDown className="w-4 h-4"/>
                </span>
            );
        }
        return (
            <span className="inline-flex ml-2">
                <ArrowUp className="w-4 h-4"/>
            </span>
        );
    };

    const filteredData = data.filter(row => {
        return (
            row.id.toString().includes(filters.id) &&
            row.cliente.toLowerCase().includes(filters.cliente.toLowerCase()) &&
            row.cuit.includes(filters.cuit) &&
            (filters.tipoSocietario === 'Todos' || row.tipoSocietario === filters.tipoSocietario)
        );
    });

    const sortedData = sortConfig.direction ? [...filteredData].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    }) : filteredData;

    return(
        <div className="p-6 w-full">
            <table className="w-full table-auto">
                <thead>
                    <tr className="bg-[#424242] text-white text-left rounded-t-3xl">
                        <th className="font-normal rounded-tl-3xl p-4 min-w-[60px]">
                            <button 
                                onClick={() => handleSort('id')}
                                className="flex items-center hover:opacity-80"
                            >
                                ID
                                {getSortIcon('id')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[200px]">
                            <button 
                                onClick={() => handleSort('cliente')}
                                className="flex items-center hover:opacity-80"
                            >
                                Cliente
                                {getSortIcon('cliente')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[140px]">
                            <button 
                                onClick={() => handleSort('cuit')}
                                className="flex items-center hover:opacity-80"
                            >
                                CUIT
                                {getSortIcon('cuit')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[150px]">
                            <button 
                                onClick={() => handleSort('tipoSocietario')}
                                className="flex items-center hover:opacity-80"
                            >
                                Tipo Societario
                                {getSortIcon('tipoSocietario')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[120px]">
                            <button 
                                onClick={() => handleSort('etiqueta')}
                                className="flex items-center hover:opacity-80"
                            >
                                Etiqueta
                                {getSortIcon('etiqueta')}
                            </button>
                        </th>
                        <th className="font-normal p-4 rounded-tr-3xl min-w-[100px]">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="pt-4 pl-4">
                            <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                <input 
                                    type="text"
                                    placeholder="Buscar"
                                    value={filters.id}
                                    onChange={(e) => handleFilterChange('id', e.target.value)}
                                    className="outline-none text-sm flex-1"
                                />
                            </div>
                        </td>
                        <td className="pt-4 pl-4">
                            <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                <input 
                                    type="text"
                                    placeholder="Buscar"
                                    value={filters.cliente}
                                    onChange={(e) => handleFilterChange('cliente', e.target.value)}
                                    className="outline-none text-sm flex-1"
                                />
                            </div>
                        </td>
                        <td className="pt-4 pl-4">
                            <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                <input 
                                    type="text"
                                    placeholder="Buscar"
                                    value={filters.cuit}
                                    onChange={(e) => handleFilterChange('cuit', e.target.value)}
                                    className="outline-none text-sm flex-1"
                                />
                            </div>
                        </td>
                        <td className="pt-4 pl-4">
                            <div className="relative">
                                <select
                                    value={filters.tipoSocietario}
                                    onChange={(e) => handleFilterChange('tipoSocietario', e.target.value)}
                                    className="appearance-none rounded px-3 py-1 pr-8 bg-white text-sm outline-none cursor-pointer w-full"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Sociedad Anónima">Sociedad Anónima</option>
                                    <option value="SRL">SRL</option>
                                    <option value="Unipersonal">Unipersonal</option>
                                </select>
                                <svg 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" 
                                    width="12" 
                                    height="8" 
                                    viewBox="0 0 12 8" 
                                    fill="currentColor"
                                >
                                    <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z"/>
                                </svg>
                            </div>
                        </td>
                        <td className="pt-4 pl-4">
                            <div className="flex items-center gap-2 rounded px-3 py-1 bg-white">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"/>
                                    <path d="m21 21-4.35-4.35"/>
                                </svg>
                                <input 
                                    type="text"
                                    placeholder="Buscar"
                                    value={filters.etiqueta}
                                    onChange={(e) => handleFilterChange('etiqueta', e.target.value)}
                                    className="outline-none text-sm flex-1"
                                />
                            </div>
                        </td>
                        <td className="pt-4 pl-4"></td>
                    </tr>
                    {sortedData.map((row, index) => (
                        <tr key={row.id}>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.id}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.cliente}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.cuit}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">
                                {row.tipoSocietarioName}
                            </td>
                            <td className="p-4 border-b border-b-[#0000001F]">
                                <LabelBadges labelIds={row.labelIds} labels={labels} />
                            </td>
                            <td className="p-4 border-b border-b-[#0000001F] text-right relative">
                                <button 
                                    className="mr-4 hover:bg-gray-100 rounded p-1"
                                    onClick={() => setOpenMenuIndex(openMenuIndex === index ? null : index)}
                                >
                                    <Ellipsis/>
                                </button>
                                
                                {openMenuIndex === index && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setOpenMenuIndex(null)}
                                        />
                                        <div className="absolute right-[20%] top-[90%] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-20 min-w-[220px]">
                                            <button 
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                                onClick={() => {
                                                    setSelectedClient(row);
                                                    setShowEditModal(true);
                                                    setOpenMenuIndex(null);
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                                </svg>
                                                <span>Editar cliente</span>
                                            </button>
                                            <button 
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                                onClick={() => {
                                                    setClientToDelete(row);
                                                    setShowDeleteModal(true);
                                                    setOpenMenuIndex(null);
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18"/>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                                </svg>
                                                <span>Borrar cliente</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <EditClientModal 
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedClient(null);
                }}
                clientData={selectedClient}
                onClientUpdated={(updatedClient) => {
                    setClients(prev => prev.map(c => 
                        c.clientId === updatedClient.clientId ? updatedClient : c
                    ));
                }}
            />

            {showDeleteModal && (
                <>
                    <div className="fixed inset-0 bg-[#27353E2E] z-60" onClick={() => setShowDeleteModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-70 w-[500px] p-8">
                        <h2 className="text-2xl font-medium mb-4">Eliminar Cliente</h2>
                        <p className="text-gray-700 mb-6">
                            ¿Estás seguro de eliminar a [{clientToDelete?.cliente}] como cliente? Se eliminará de todos los contactos en los que está asociado.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setClientToDelete(null);
                                }}
                                className="flex-1 px-6 py-3 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await clientesAPI.delete(clientToDelete.clientId);
                                        setClients(prev => prev.filter(c => c.clientId !== clientToDelete.clientId));
                                        addToast('Cliente eliminado correctamente', 'success');
                                        setShowDeleteModal(false);
                                        setClientToDelete(null);
                                    } catch (error) {
                                        console.error('Error al eliminar cliente:', error);
                                        addToast('Error al eliminar el cliente', 'error');
                                    }
                                }}
                                className="flex-1 px-6 py-3 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4]"
                            >
                                Eliminar cliente
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ClientesTable;
