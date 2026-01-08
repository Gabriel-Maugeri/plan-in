import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../components/ToastContainer';
import { contactsAPI } from '../../services/api';

function EditContactModal({ isOpen, onClose, contactData, onUpdate }) {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        usuarioApp: ''
    });
    const [existingContacts, setExistingContacts] = useState([]);
    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await contactsAPI.getAll();
                setExistingContacts(data);
            } catch (error) {
                console.error('Error al obtener contactos:', error);
            }
        };
        
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (contactData) {
            setFormData({
                nombre: contactData.nombreApellido || '',
                correo: contactData.correo || '',
                usuarioApp: contactData.usuarioApp || ''
            });
            setEmailError('');
            setUsernameError('');
        }
    }, [contactData]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'correo') {
            setEmailError('');
        }
        if (field === 'usuarioApp') {
            setUsernameError('');
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            return 'Por favor ingrese un email válido';
        }
        
        const isDuplicate = existingContacts.some(
            contact => contact.mail?.toLowerCase() === email.toLowerCase() && contact.contactId !== contactData?.id
        );
        return isDuplicate ? 'Este correo ya está en uso por otro contacto' : '';
    };

    const validateUsername = (username) => {
        if (!username || username.trim() === '') return '';
        const isDuplicate = existingContacts.some(
            contact => contact.usernameApp?.toLowerCase() === username.toLowerCase() && contact.contactId !== contactData?.id
        );
        return isDuplicate ? 'Este usuario de app ya está en uso por otro contacto' : '';
    };

    const handleEmailBlur = () => {
        const error = validateEmail(formData.correo);
        setEmailError(error);
    };

    const handleUsernameBlur = () => {
        const error = validateUsername(formData.usuarioApp);
        setUsernameError(error);
    };

    const handleSubmit = async () => {
        const emailValidation = validateEmail(formData.correo);
        const usernameValidation = validateUsername(formData.usuarioApp);
        
        if (emailValidation) {
            setEmailError(emailValidation);
            return;
        }
        
        if (usernameValidation) {
            setUsernameError(usernameValidation);
            return;
        }

        try {
            const payload = {
                contact: formData.nombre,
                mail: formData.correo,
                usernameApp: formData.usuarioApp,
                phoneNumber: ''
            };

            const updatedContact = await contactsAPI.update(contactData.id, payload);
            
            if (onUpdate) {
                await onUpdate(contactData.id, updatedContact);
            }
            
            addToast('Contacto actualizado correctamente', 'success');
            onClose();
        } catch (error) {
            console.error('Error al actualizar contacto:', error);
            addToast('Error al actualizar el contacto', 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-[#27353E2E] z-40 flex items-center justify-center"
                onClick={onClose}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-[532px] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-normal">Editar Contacto</h2>
                    <button 
                        onClick={onClose}
                        className="hover:bg-gray-100 p-1 rounded-full"
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
                        />
                        {emailError && (
                            <p className="text-red-500 text-sm mt-1">{emailError}</p>
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
                            onBlur={handleUsernameBlur}
                            className={`w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm ${
                                usernameError ? 'border-2 border-red-500' : ''
                            }`}
                        />
                        {usernameError && (
                            <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={emailError || usernameError}
                        className={`flex-1 px-6 py-3 rounded-full text-white font-normal ${
                            emailError || usernameError
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-[#72BFDD] hover:bg-[#5fa8c4]'
                        }`}
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </>
    );
}

export default EditContactModal;
