import { ArrowDown, ArrowUp, ArrowUpDown, Ellipsis, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import EditContactModal from './EditContactModal';
import DeleteContactModal from './DeleteContactModal';
import ShareContactModal from './ShareContactModal';
import ManageClientsModal from './ManageClientsModal';
import { contactsAPI, clientesAPI } from '../../services/api';
import { useToast } from '../../components/ToastContainer';

function ClientBadges({ clientes, onManageClients }) {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(clientes.length);

    useEffect(() => {
        const calculateVisibleBadges = () => {
            if (!containerRef.current || clientes.length === 0) return;

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

            for (let i = 0; i < clientes.length; i++) {
                tempDiv.textContent = clientes[i].businessName;
                const badgeWidth = tempDiv.offsetWidth + 24;
                
                const neededWidth = totalWidth + badgeWidth + (i > 0 ? gap : 0);
                const willNeedPlusBadge = i < clientes.length - 1;
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

        calculateVisibleBadges();
        window.addEventListener('resize', calculateVisibleBadges);
        return () => window.removeEventListener('resize', calculateVisibleBadges);
    }, [clientes]);

    if (clientes.length === 0) {
        return (
            <div ref={containerRef} className="flex gap-2">
                <span 
                    onClick={onManageClients}
                    className="px-3 py-1 rounded-full text-sm bg-[#F5F5F5] text-gray-400 cursor-pointer hover:bg-[#E5E5E5] whitespace-nowrap"
                >
                    Sin clientes
                </span>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex gap-2">
            {clientes.slice(0, visibleCount).map((cliente) => (
                <span 
                    key={cliente.clientId}
                    onClick={onManageClients}
                    className="px-3 py-1 rounded-full text-sm bg-[#E0E0E0] text-[#424242] cursor-pointer hover:bg-[#D0D0D0] whitespace-nowrap"
                >
                    {cliente.businessName}
                </span>
            ))}
            {clientes.length > visibleCount && (
                <span 
                    onClick={onManageClients}
                    className="px-3 py-1 rounded-full text-sm bg-[#C5CAE9] text-[#3F51B5] cursor-pointer hover:bg-[#B5BFD9] whitespace-nowrap"
                >
                    +{clientes.length - visibleCount}
                </span>
            )}
        </div>
    );
}

function ContactosTable({ onAddContact }) {
    const { addToast } = useToast();
    const badgeRefs = useRef({});
    const [filters, setFilters] = useState({
        id: '',
        nombreApellido: '',
        correo: '',
        clientes: [],
        usuarioApp: '',
        accesoApp: 'Todos'
    });

    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: null
    });

    const [openMenuIndex, setOpenMenuIndex] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showManageClientsModal, setShowManageClientsModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allClients, setAllClients] = useState([]);
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
        fetchContacts();
    }, []);

    const fetchClients = async () => {
        try {
            const data = await clientesAPI.getAll();
            setAllClients(data);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const data = await contactsAPI.getAll();
            
            const contactsWithClients = data.map((contact) => ({
                id: contact.contactId,
                nombreApellido: contact.contact,
                correo: contact.mail,
                clientes: contact.clients || [],
                usuarioApp: contact.usernameApp || '-',
                accesoApp: contact.status === 1 
                    ? { status: 'Activo', color: '#4ADE80' }
                    : contact.status === 2
                    ? { status: 'Pendiente', color: '#FB923C' }
                    : { status: 'Inactivo', color: '#EF4444' }
            }));
            
            setContacts(contactsWithClients);
        } catch (error) {
            console.error('Error al cargar contactos:', error);
            addToast('Error al cargar contactos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleClientFilter = (clientId) => {
        setFilters(prev => ({
            ...prev,
            clientes: prev.clientes.includes(clientId)
                ? prev.clientes.filter(id => id !== clientId)
                : [...prev.clientes, clientId]
        }));
    };

    const toggleAllClients = () => {
        setFilters(prev => ({
            ...prev,
            clientes: prev.clientes.length === allClients.length
                ? []
                : allClients.map(c => c.clientId)
        }));
    };

    const filteredClientsList = allClients.filter(client =>
        client.businessName.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );

    const handleManageClients = (contact) => {
        setSelectedContact(contact);
        setShowManageClientsModal(true);
    };

    useEffect(() => {
        if (onAddContact) {
            window.addContactToTable = (newContact) => {
                const contactWithClients = {
                    id: newContact.contactId,
                    nombreApellido: newContact.contact,
                    correo: newContact.mail,
                    clientes: newContact.clients || [],
                    usuarioApp: newContact.usernameApp || '-',
                    accesoApp: newContact.status === 1 
                        ? { status: 'Activo', color: '#4ADE80' }
                        : newContact.status === 2
                        ? { status: 'Pendiente', color: '#FB923C' }
                        : { status: 'Inactivo', color: '#EF4444' }
                };
                setContacts(prev => [...prev, contactWithClients]);
            };
        }
    }, [onAddContact]);

    const updateContactInState = (contactId, updatedData) => {
        setContacts(prev => prev.map(contact => 
            contact.id === contactId
                ? {
                    ...contact,
                    nombreApellido: updatedData.contact,
                    correo: updatedData.mail,
                    usuarioApp: updatedData.usernameApp || '-',
                    clientes: updatedData.clients || contact.clientes
                }
                : contact
        ));
    };

    const removeContactFromState = (contactId) => {
        setContacts(prev => prev.filter(contact => contact.id !== contactId));
    };

    const updateContactClientsInState = async (contactId) => {
        try {
            const allContacts = await contactsAPI.getAll();
            const updatedContact = allContacts.find(c => c.contactId === contactId);
            if (updatedContact) {
                setContacts(prev => prev.map(contact => 
                    contact.id === contactId
                        ? { ...contact, clientes: updatedContact.clients || [] }
                        : contact
                ));
            }
        } catch (error) {
            console.error('Error al actualizar clientes en estado:', error);
        }
    };

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

    const filteredData = contacts.filter(row => {
        const hasSelectedClients = filters.clientes.length === 0 || 
            row.clientes.length === 0 ||
            row.clientes.some(client => filters.clientes.includes(client.clientId));
        
        return (
            row.id.toString().includes(filters.id) &&
            row.nombreApellido.toLowerCase().includes(filters.nombreApellido.toLowerCase()) &&
            row.correo.toLowerCase().includes(filters.correo.toLowerCase()) &&
            row.usuarioApp.toLowerCase().includes(filters.usuarioApp.toLowerCase()) &&
            (filters.accesoApp === 'Todos' || row.accesoApp.status === filters.accesoApp) &&
            hasSelectedClients
        );
    });

    const sortedData = sortConfig.direction ? [...filteredData].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'clientes') {
            aValue = a.clientes.length;
            bValue = b.clientes.length;
        } else if (sortConfig.key === 'accesoApp') {
            aValue = a.accesoApp.status;
            bValue = b.accesoApp.status;
        } else if (typeof aValue === 'string') {
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
                        <th className="font-normal p-4 min-w-[150px]">
                            <button 
                                onClick={() => handleSort('nombreApellido')}
                                className="flex items-center hover:opacity-80"
                            >
                                Nombre y Apellido
                                {getSortIcon('nombreApellido')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[180px]">
                            <button 
                                onClick={() => handleSort('correo')}
                                className="flex items-center hover:opacity-80"
                            >
                                Correo Electrónico
                                {getSortIcon('correo')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[200px]">
                            <button 
                                onClick={() => handleSort('clientes')}
                                className="flex items-center hover:opacity-80"
                            >
                                Clientes
                                {getSortIcon('clientes')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[120px]">
                            <button 
                                onClick={() => handleSort('usuarioApp')}
                                className="flex items-center hover:opacity-80"
                            >
                                Usuario App
                                {getSortIcon('usuarioApp')}
                            </button>
                        </th>
                        <th className="font-normal p-4 min-w-[120px]">
                            <button 
                                onClick={() => handleSort('accesoApp')}
                                className="flex items-center hover:opacity-80"
                            >
                                Acceso a App
                                {getSortIcon('accesoApp')}
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
                                    value={filters.nombreApellido}
                                    onChange={(e) => handleFilterChange('nombreApellido', e.target.value)}
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
                                    value={filters.correo}
                                    onChange={(e) => handleFilterChange('correo', e.target.value)}
                                    className="outline-none text-sm flex-1"
                                />
                            </div>
                        </td>
                        <td className="pt-4 pl-4">
                            <div className="relative">
                                <div 
                                    className="flex items-center justify-between rounded px-3 py-1 bg-white cursor-pointer"
                                    onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                                >
                                    <span className="text-sm">
                                        {filters.clientes.length === allClients.length ? 'Todos' : `${filters.clientes.length} seleccionados`}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`}/>
                                </div>

                                {isClientDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setIsClientDropdownOpen(false)}
                                        />
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#72BFDD] rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                                            <div className="p-3 border-b">
                                                <input
                                                    type="text"
                                                    value={clientSearchTerm}
                                                    onChange={(e) => setClientSearchTerm(e.target.value)}
                                                    placeholder="Buscar clientes"
                                                    className="w-full px-3 py-2 bg-[#F5F5F5] rounded outline-none text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="p-2">
                                                <label 
                                                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded font-medium border-b"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.clientes.length === allClients.length}
                                                        onChange={toggleAllClients}
                                                        className="w-4 h-4 accent-[#72BFDD]"
                                                    />
                                                    <span className="text-sm">Seleccionar todos</span>
                                                </label>
                                                {filteredClientsList.map(client => (
                                                    <label 
                                                        key={client.clientId}
                                                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={filters.clientes.includes(client.clientId)}
                                                            onChange={() => toggleClientFilter(client.clientId)}
                                                            className="w-4 h-4 accent-[#72BFDD]"
                                                        />
                                                        <span className="text-sm">{client.businessName}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
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
                                    value={filters.usuarioApp}
                                    onChange={(e) => handleFilterChange('usuarioApp', e.target.value)}
                                    className="outline-none text-sm flex-1"
                                />
                            </div>
                        </td>
                        <td className="pt-4 pl-4">
                            <div className="relative">
                                <select
                                    value={filters.accesoApp}
                                    onChange={(e) => handleFilterChange('accesoApp', e.target.value)}
                                    className="appearance-none rounded px-3 py-1 pr-8 bg-white text-sm outline-none cursor-pointer w-full"
                                >
                                    <option value="Todos">Todos</option>
                                    <option value="Activo">Activo</option>
                                    <option value="Pendiente">Pendiente</option>
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
                        <td className="pt-4 pl-4"></td>
                    </tr>
                    {sortedData.map((row, index) => (
                        <tr key={row.id}>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.id}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.nombreApellido}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.correo}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">
                                <ClientBadges 
                                    clientes={row.clientes}
                                    onManageClients={() => handleManageClients(row)}
                                />
                            </td>
                            <td className="p-4 border-b border-b-[#0000001F]">{row.usuarioApp}</td>
                            <td className="p-4 border-b border-b-[#0000001F]">
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="w-2 h-2 rounded-full" 
                                        style={{ backgroundColor: row.accesoApp.color }}
                                    />
                                    <span>{row.accesoApp.status}</span>
                                </div>
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
                                                    setSelectedContact(row);
                                                    setShowEditModal(true);
                                                    setOpenMenuIndex(null);
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                                </svg>
                                                <span>Editar contacto</span>
                                            </button>
                                            <button 
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                                onClick={() => {
                                                    setSelectedContact(row);
                                                    setShowDeleteModal(true);
                                                    setOpenMenuIndex(null);
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18"/>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                                </svg>
                                                <span>Borrar contacto</span>
                                            </button>
                                            <button 
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3"
                                                onClick={() => {
                                                    setSelectedContact(row);
                                                    setShowShareModal(true);
                                                    setOpenMenuIndex(null);
                                                }}
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                                    <circle cx="9" cy="7" r="4"/>
                                                    <line x1="19" x2="19" y1="8" y2="14"/>
                                                    <line x1="22" x2="16" y1="11" y2="11"/>
                                                </svg>
                                                <span>Compartir</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <EditContactModal 
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                contactData={selectedContact}
                onUpdate={updateContactInState}
            />
            
            <DeleteContactModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                    if (selectedContact) {
                        removeContactFromState(selectedContact.id);
                    }
                }}
                contactData={selectedContact}
            />
            
            <ShareContactModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                contactData={selectedContact}
            />

            <ManageClientsModal 
                isOpen={showManageClientsModal}
                onClose={() => setShowManageClientsModal(false)}
                contactId={selectedContact?.id}
                contactName={selectedContact?.nombreApellido}
                onUpdate={() => {
                    if (selectedContact) {
                        updateContactClientsInState(selectedContact.id);
                    }
                    addToast('Clientes actualizados correctamente', 'success');
                }}
            />
        </div>
    )
}

export default ContactosTable;
