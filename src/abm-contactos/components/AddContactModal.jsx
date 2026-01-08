import { useState, useEffect, createContext, useContext } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { contactsAPI, clientesAPI } from '../../services/api';
import { useToast } from '../../components/ToastContainer';

const ContactsContext = createContext();

export const ContactsProvider = ({ children, addContact }) => (
    <ContactsContext.Provider value={{ addContact }}>
        {children}
    </ContactsContext.Provider>
);

export const useContacts = () => {
    const context = useContext(ContactsContext);
    return context || {};
};

function AddContactModal({ isOpen, onClose, hideClientAssociation = false }) {
    const { addToast } = useToast();
    const { addContact } = useContacts();
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        usuarioApp: '',
        clientes: []
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [availableClientes, setAvailableClientes] = useState([]);
    const [existingContacts, setExistingContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchClientes();
            fetchContacts();
        }
    }, [isOpen]);

    const fetchClientes = async () => {
        try {
            const data = await clientesAPI.getAll();
            setAvailableClientes(data.map(cliente => ({
                id: cliente.clientId,
                nombre: cliente.businessName
            })));
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        }
    };

    const fetchContacts = async () => {
        try {
            const data = await contactsAPI.getAll();
            setExistingContacts(data);
        } catch (error) {
            console.error('Error al cargar contactos:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (field === 'correo') {
            setEmailError('');
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            setEmailError('Por favor ingrese un email válido');
            return false;
        }
        
        const emailExists = existingContacts.some(
            contact => contact.mail.toLowerCase() === email.toLowerCase()
        );
        
        if (emailExists) {
            setEmailError('Este correo ya está en uso por otro contacto');
            return false;
        }
        
        setEmailError('');
        return true;
    };

    const handleEmailBlur = () => {
        validateEmail(formData.correo);
    };

    const toggleCliente = (clienteId) => {
        setFormData(prev => ({
            ...prev,
            clientes: prev.clientes.includes(clienteId)
                ? prev.clientes.filter(id => id !== clienteId)
                : [...prev.clientes, clienteId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(formData.correo)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const contactPayload = {
                contact: formData.nombre,
                mail: formData.correo,
                usernameApp: formData.usuarioApp,
                phoneNumber: ''
            };

            const createdContact = await contactsAPI.create(contactPayload);

            if (formData.clientes.length > 0) {
                await Promise.all(
                    formData.clientes.map(clientId =>
                        contactsAPI.associateClient(createdContact.contactId, clientId)
                    )
                );
            }

            if (window.addContactToTable) {
                await window.addContactToTable(createdContact);
            }

            addToast('Contacto creado correctamente', 'success');
            
            onClose();
            setFormData({
                nombre: '',
                correo: '',
                usuarioApp: '',
                clientes: []
            });
            setEmailError('');
        } catch (error) {
            console.error('Error al crear contacto:', error);
            addToast('Error al crear el contacto', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSelectedClientesDisplay = () => {
        const selected = availableClientes.filter(c => formData.clientes.includes(c.id));
        if (selected.length === 0) return null;
        if (selected.length <= 2) {
            return selected.map(c => c.nombre).join(', ');
        }
        return `${selected[0].nombre}, ${selected[1].nombre}, +${selected.length - 2}`;
    };

    const filteredClientes = availableClientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-[#27353E2E] z-40 flex items-center justify-center"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-[532px] shadow-2xl">
                <div className="flex justify-center items-center mb-6 relative">
                    <h2 className="text-2xl font-normal">Alta de Contacto</h2>
                    <button 
                        onClick={onClose}
                        className="hover:bg-gray-100 p-1 rounded-full absolute right-0"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-normal mb-2">
                            Nombre del Contacto
                        </label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                            placeholder=""
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-normal mb-2">
                            Dirección de Correo
                        </label>
                        <input
                            type="email"
                            value={formData.correo}
                            onChange={(e) => handleInputChange('correo', e.target.value)}
                            onBlur={handleEmailBlur}
                            className={`w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm ${
                                emailError ? 'border-2 border-red-500' : ''
                            }`}
                            placeholder=""
                        />
                        {emailError && (
                            <p className="text-red-500 text-xs mt-1">{emailError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-normal mb-2">
                            Usuario de App
                        </label>
                        <input
                            type="text"
                            value={formData.usuarioApp}
                            onChange={(e) => handleInputChange('usuarioApp', e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                            placeholder=""
                        />
                    </div>

                    {!hideClientAssociation && <div className="relative">
                        <label className="block text-sm font-normal mb-2">
                            Asociar Cliente(s)
                        </label>
                        <div 
                            className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg cursor-pointer flex items-center justify-between"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <div className="flex-1">
                                {formData.clientes.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {availableClientes
                                            .filter(c => formData.clientes.includes(c.id))
                                            .slice(0, 2)
                                            .map(cliente => (
                                                <span 
                                                    key={cliente.id}
                                                    className="px-3 py-1 bg-white rounded-full text-sm border border-[#72BFDD]"
                                                >
                                                    {cliente.nombre}
                                                </span>
                                            ))
                                        }
                                        {formData.clientes.length > 2 && (
                                            <span className="px-3 py-1 bg-[#C5CAE9] text-[#3F51B5] rounded-full text-sm">
                                                +{formData.clientes.length - 2}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <path d="m21 21-4.35-4.35"/>
                                        </svg>
                                        <span className="text-sm">Buscar clientes</span>
                                    </div>
                                )}
                            </div>
                            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#72BFDD] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                                <div className="p-3 border-b">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Buscar clientes"
                                        className="w-full px-3 py-2 bg-[#F5F5F5] rounded outline-none text-sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                                <div className="p-2">
                                    {filteredClientes.map(cliente => (
                                        <label 
                                            key={cliente.id}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.clientes.includes(cliente.id)}
                                                onChange={() => toggleCliente(cliente.id)}
                                                className="w-4 h-4 accent-[#72BFDD]"
                                            />
                                            <span className="text-sm">{cliente.nombre}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !!emailError}
                        className="px-8 py-3 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creando...' : 'Agregar contacto'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default AddContactModal;
