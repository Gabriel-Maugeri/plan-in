import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, Check } from 'lucide-react';
import { contactsAPI } from '../../services/api';
import QRCode from 'qrcode';

function ShareContactModal({ isOpen, onClose, contactData }) {
    const [step, setStep] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const contentRef = useRef(null);
    const [emailData, setEmailData] = useState({
        correo: '',
        titulo: 'Te compartimos los datos para acceder a la aplicación de Plan In',
        mensaje: `Desde los links podrás descargar la aplicación de Plan In. Con esta app nos mantendremos conectados, ya sea que el estudio les envíe presentaciones o informes, y porque además allí podrán visualizar sus últimos inventarios y propuestas, los próximos vencimientos y mos información relacionada a nuestro servicio profesional.

Play Store: https://play.google.com/store/apps/details?id=net.planin.app&pli=1
App Store: https://apps.apple.com/ar/app/plan-in-app/id6738100014

Ya te generamos un usuario para que puedas ingresar y trabajar con los siguientes contribuyentes:
Cliente Demo 01 - Cliente Demo 02 - Cliente Demo 03 - Cliente Demo 04 - Cliente Demo 05 - Cliente Demo 06 - Cliente Demo 07 - Cliente Demo 08 - Cliente Demo 09 - Cliente Demo 10 - Cliente Demo 11 - Cliente Demo 12 - Cliente Demo 13 - Cliente Demo 14`
    });

    const handleClose = () => {
        setStep(1);
        setShowToast(false);
        onClose();
    };

    useEffect(() => {
        if (isOpen && contactData?.id) {
            fetchClients();
        }
    }, [isOpen, contactData]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const clientsData = await contactsAPI.getClients(contactData.id);
            setClients(clientsData);
            
            // Update mensaje with actual client names
            if (clientsData && clientsData.length > 0) {
                const clientNames = clientsData.map(c => c.businessName || c).join(' - ');
                setEmailData(prev => ({
                    ...prev,
                    mensaje: `Desde los links podrás descargar la aplicación de Plan In. Con esta app nos mantendremos conectados, ya sea que el estudio les envíe presentaciones o informes, y porque además allí podrán visualizar sus últimos inventarios y propuestas, los próximos vencimientos y mos información relacionada a nuestro servicio profesional.

Play Store: https://play.google.com/store/apps/details?id=net.planin.app&pli=1
App Store: https://apps.apple.com/ar/app/plan-in-app/id6738100014

Ya te generamos un usuario para que puedas ingresar y trabajar con los siguientes contribuyentes:
${clientNames}`
                }));
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyData = async () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 700;
            canvas.height = 1400;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const padding = 40;
            let y = padding + 30;

            const data = [
                { label: 'Nombre del Contacto', value: contactData?.nombreApellido },
                { label: 'Correo de Contacto', value: contactData?.correo },
                { label: 'ID', value: contactData?.id },
                { label: 'Email', value: contactData?.correo },
                { label: 'Usuario Acceso', value: '-' },
                { label: 'Clave Acceso', value: 'Undefined' }
            ];

            ctx.font = '14px Arial';
            data.forEach((item, idx) => {
                const x = idx % 2 === 0 ? padding : canvas.width / 2 + 20;
                if (idx % 2 === 0 && idx > 0) y += 70;
                
                ctx.fillStyle = '#666666';
                ctx.fillText(item.label, x, y);
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 16px Arial';
                ctx.fillText(item.value || '-', x, y + 25);
                ctx.font = '14px Arial';
            });

            y += 80;
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();

            y += 40;
            ctx.fillStyle = '#000000';
            ctx.fillText('Puedes descargar la aplicación desde:', padding, y);
            
            const appStoreQR = await QRCode.toDataURL('https://apps.apple.com/ar/app/plan-in-app/id6738100014', { width: 150 });
            const playStoreQR = await QRCode.toDataURL('https://play.google.com/store/apps/details?id=net.planin.app&pli=1', { width: 150 });
            
            y += 20;
            const appStoreImg = new Image();
            appStoreImg.src = appStoreQR;
            await new Promise(resolve => { appStoreImg.onload = resolve; });
            ctx.drawImage(appStoreImg, padding, y, 150, 150);
            
            const playStoreImg = new Image();
            playStoreImg.src = playStoreQR;
            await new Promise(resolve => { playStoreImg.onload = resolve; });
            ctx.drawImage(playStoreImg, padding + 180, y, 150, 150);

            ctx.font = '12px Arial';
            ctx.fillText('App Store', padding + 50, y + 170);
            ctx.fillText('Google Play', padding + 220, y + 170);

            y += 220;
            ctx.strokeStyle = '#E0E0E0';
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();

            y += 40;
            ctx.font = '14px Arial';
            ctx.fillText('Ya te generamos un usuario para que puedas ingresar y trabajar', padding, y);
            ctx.fillText('con los siguientes contribuyentes:', padding, y + 22);
            
            y += 50;
            const badgeHeight = 32;
            const badgePadding = 12;
            const badgeMargin = 10;
            let currentX = padding;
            let maxRowWidth = canvas.width - (padding * 2);

            clients.forEach((client, idx) => {
                const text = client.businessName || client;
                ctx.font = '14px Arial';
                const textWidth = ctx.measureText(text).width;
                const badgeWidth = textWidth + (badgePadding * 2);

                if (currentX + badgeWidth > canvas.width - padding) {
                    currentX = padding;
                    y += badgeHeight + badgeMargin;
                }

                ctx.fillStyle = '#E0E0E0';
                ctx.beginPath();
                ctx.roundRect(currentX, y, badgeWidth, badgeHeight, 16);
                ctx.fill();

                ctx.fillStyle = '#000000';
                ctx.fillText(text, currentX + badgePadding, y + badgeHeight / 2 + 5);

                currentX += badgeWidth + badgeMargin;
            });

            canvas.toBlob(blob => {
                const item = new ClipboardItem({ 'image/png': blob });
                navigator.clipboard.write([item]).then(() => {
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `contacto-${contactData?.nombreApellido || 'datos'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const handleSendEmail = async () => {
        if (step === 1) {
            setEmailData(prev => ({ ...prev, correo: contactData?.correo || '' }));
            setStep(2);
        } else {
            try {
                const payload = {
                    from: 'User',
                    subject: emailData.titulo,
                    body: emailData.mensaje,
                    attachments: '',
                    ixFiles: '',
                    clients: clients.map(client => ({
                        cLientId: client.clientId,
                        contacts: [{
                            contactType: 'ClientMail',
                            entityContactId: contactData.id
                        }]
                    }))
                };

                const response = await fetch(
                    `${import.meta.env.VITE_API_ABMS_URL}/mass-mail-sent/bulk-from-contacts`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(payload)
                    }
                );

                if (!response.ok) throw new Error('Error al enviar correo');
                
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    handleClose();
                }, 2000);
            } catch (error) {
                console.error('Error al enviar correo:', error);
            }
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    if (!isOpen) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-[#27353E2E] z-40 flex items-center justify-center"
                onClick={handleClose}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-50 w-[670px] shadow-2xl max-h-[90vh] overflow-y-auto">
                {step === 1 ? (
                    <>
                        <div className="flex items-center mb-6 relative">
                            <h2 className="text-2xl font-normal flex-1 text-center">Compartir Contacto</h2>
                            <button 
                                onClick={handleClose}
                                className="hover:bg-gray-100 p-1 rounded-full absolute right-0"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className='px-15 py-6'>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Nombre del Contacto</p>
                                    <p className="font-medium">{contactData?.nombreApellido}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Correo de Contacto</p>
                                    <p className="font-medium">{contactData?.correo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">ID</p>
                                    <p className="font-medium">{contactData?.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Email</p>
                                    <p className="font-medium">{contactData?.correo}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Usuario Acceso</p>
                                    <p className="font-medium">-</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Clave Acceso</p>
                                    <p className="font-medium">Undefined</p>
                                </div>
                            </div>

                            <div className="border-t border-[#E0E0E0] pt-6 mb-6">
                                <p className="text-sm mb-3">Puedes descargar la aplicación desde:</p>
                                <div className="flex gap-3">
                                    <img src="/assets/images/app-store.png" alt="App Store" className="h-10"/>
                                    <img src="/assets/images/google-play.png" alt="Google Play" className="h-10"/>
                                </div>
                            </div>

                            <div className="border-t border-[#E0E0E0] pt-6 mb-6">
                                <p className="text-sm mb-3">Ya te generamos un usuario para que puedas ingresar y trabajar con los siguientes contribuyentes:</p>
                                <div className="flex flex-wrap gap-2">
                                    {loading ? (
                                        <span className="text-sm text-gray-500">Cargando...</span>
                                    ) : (
                                        clients?.map((cliente, idx) => (
                                            <span 
                                                key={idx}
                                                className="px-3 py-1 bg-[#E0E0E0] rounded-full text-sm"
                                            >
                                                {cliente.businessName || cliente}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>


                        {showToast && (
                            <div className="mb-4 bg-[#E8F5E9] rounded-lg px-4 py-3 flex items-center gap-3">
                                <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4 text-white"/>
                                </div>
                                <span className="text-gray-800 text-sm">Datos de acceso copiados al portapapeles.</span>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCopyData}
                                className="flex-1 px-6 py-2 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
                            >
                                Copiar Datos
                            </button>
                            <button
                                onClick={handleSendEmail}
                                className="flex-1 px-6 py-2 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
                            >
                                Enviar por Correo
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <button 
                                onClick={handleBack}
                                className="hover:bg-gray-100 p-1 rounded-full"
                            >
                                <ChevronLeft className="w-5 h-5"/>
                            </button>
                            <h2 className="text-2xl font-normal flex-1 text-center">Enviar por Correo</h2>
                            <button 
                                onClick={handleClose}
                                className="hover:bg-gray-100 p-1 rounded-full"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-normal mb-2">
                                    Enviar al Correo:
                                </label>
                                <input
                                    type="email"
                                    value={emailData.correo}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, correo: e.target.value }))}
                                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-normal mb-2">
                                    Título
                                </label>
                                <textarea
                                    value={emailData.titulo}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm resize-none"
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-normal mb-2">
                                    Mensaje
                                </label>
                                <textarea
                                    value={emailData.mensaje}
                                    onChange={(e) => setEmailData(prev => ({ ...prev, mensaje: e.target.value }))}
                                    className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm resize-none"
                                    rows="12"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={handleClose}
                                className="flex-1 px-6 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSendEmail}
                                className="flex-1 px-6 py-2 bg-[#72BFDD] rounded-full text-white hover:bg-[#5fa8c4] font-normal"
                            >
                                Enviar por Correo
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default ShareContactModal;
