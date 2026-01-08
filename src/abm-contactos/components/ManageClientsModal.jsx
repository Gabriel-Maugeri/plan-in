import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { clientesAPI, contactsAPI } from '../../services/api';
import { useToast } from '../../components/ToastContainer';

function ManageClientsModal({ isOpen, onClose, contactId, contactName, onUpdate }) {
    const { addToast } = useToast();
    const [allClients, setAllClients] = useState([]);
    const [associatedClients, setAssociatedClients] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [initialSelected, setInitialSelected] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && contactId) {
            fetchData();
        }
    }, [isOpen, contactId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clients, associated] = await Promise.all([
                clientesAPI.getAll(),
                contactsAPI.getClients(contactId)
            ]);
            
            setAllClients(clients);
            setAssociatedClients(associated);
            
            const associatedIds = associated.map(c => c.clientId);
            setSelectedClients(associatedIds);
            setInitialSelected(associatedIds);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleClient = (clientId) => {
        setSelectedClients(prev => 
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };

    const hasChanges = () => {
        if (selectedClients.length !== initialSelected.length) return true;
        return !selectedClients.every(id => initialSelected.includes(id));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const toAssociate = selectedClients.filter(id => !initialSelected.includes(id));
            const toDisassociate = initialSelected.filter(id => !selectedClients.includes(id));

            await Promise.all([
                ...toAssociate.map(clientId => contactsAPI.associateClient(contactId, clientId)),
                ...toDisassociate.map(clientId => contactsAPI.disassociateClient(contactId, clientId))
            ]);

            if (onUpdate) {
                onUpdate();
            }

            onClose();
        } catch (error) {
            console.error('Error al guardar cambios:', error);
            addToast('Error al guardar los cambios', 'error');
        } finally {
            setSaving(false);
        }
    };

    const filteredClients = allClients.filter(client =>
        client.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedClientNames = allClients
        .filter(c => selectedClients.includes(c.clientId))
        .map(c => c.businessName);

    const [visibleBadgeCount, setVisibleBadgeCount] = useState(selectedClientNames.length);
    const badgeContainerRef = useRef(null);

    useEffect(() => {
        const calculateVisibleBadges = () => {
            if (selectedClientNames.length === 0 || !badgeContainerRef.current) {
                setVisibleBadgeCount(0);
                return;
            }

            const container = badgeContainerRef.current;
            const containerWidth = container.offsetWidth * 0.75;
            const gap = 8;
            const plusBadgeWidth = 60;
            let totalWidth = 0;
            let count = 0;

            const tempDiv = document.createElement('div');
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.position = 'absolute';
            tempDiv.className = 'px-3 py-1 rounded-full text-sm border border-gray-300';
            document.body.appendChild(tempDiv);

            for (let i = 0; i < selectedClientNames.length; i++) {
                tempDiv.textContent = selectedClientNames[i];
                const badgeWidth = tempDiv.offsetWidth + 24;
                
                const neededWidth = totalWidth + badgeWidth + (i > 0 ? gap : 0);
                const willNeedPlusBadge = i < selectedClientNames.length - 1;
                const totalNeededWidth = neededWidth + (willNeedPlusBadge ? gap + plusBadgeWidth : 0);

                if (totalNeededWidth > containerWidth) {
                    break;
                }

                totalWidth = neededWidth;
                count++;
            }

            document.body.removeChild(tempDiv);
            setVisibleBadgeCount(Math.max(0, count));
        };

        const timeoutId = setTimeout(calculateVisibleBadges, 0);
        window.addEventListener('resize', calculateVisibleBadges);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculateVisibleBadges);
        };
    }, [selectedClients.length, allClients.length]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-[#27353E] opacity-[0.18] z-40" onClick={onClose} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 w-[1110px] h-[90vh] max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-center p-6 relative">
                    <h2 className="text-xl font-medium">Clientes vinculados al contacto</h2>
                    <button
                        onClick={onClose}
                        className="absolute right-6 hover:bg-gray-100 p-1 rounded"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 px-30">
                    <div className="flex justify-between items-center mb-4 px-9 text-xl font-medium">
                        <h3>Clientes</h3>
                        <h3>Vinculado</h3>
                    </div>

                    <div className="mb-4 relative">
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#F5F5F5] rounded-lg">
                            <Search className="w-5 h-5 text-gray-400 shrink-0" />
                            {selectedClients.length > 0 && (
                                <div ref={badgeContainerRef} className="flex flex-wrap gap-2 max-w-[75%]">
                                    {selectedClientNames.map((name, idx) => (
                                        <span
                                            key={idx}
                                            className={`badge-item px-3 py-1 bg-white rounded-full text-sm border border-gray-300 whitespace-nowrap ${idx >= visibleBadgeCount ? 'hidden' : ''}`}
                                        >
                                            {name}
                                        </span>
                                    ))}
                                    {visibleBadgeCount < selectedClients.length && (
                                        <span className="px-3 py-1 bg-[#C5CAE9] text-[#3F51B5] rounded-full text-sm whitespace-nowrap">
                                            +{selectedClients.length - visibleBadgeCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={selectedClients.length === 0 ? "Buscar" : ""}
                                className="flex-1 bg-transparent outline-none text-sm min-w-[100px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 border border-[#E0E0E0] rounded-[20px] p-6 overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Cargando...</div>
                        ) : (
                            filteredClients.map(client => (
                                <label
                                    key={client.clientId}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-[#E0E0E0]"
                                >
                                    <span className="text-sm">{client.businessName}</span>
                                    <input
                                        type="checkbox"
                                        checked={selectedClients.includes(client.clientId)}
                                        onChange={() => toggleClient(client.clientId)}
                                        className="w-5 h-5 accent-[#72BFDD]"
                                    />
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-center p-6">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges() || saving}
                        className={`px-8 py-3 rounded-full font-normal ${
                            hasChanges() && !saving
                                ? 'bg-[#72BFDD] text-white hover:bg-[#5fa8c4]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default ManageClientsModal;
