import { useState, useEffect } from 'react';
import { studyAPI } from '../services/api';
import { useToast } from '../components/ToastContainer';
import AccountHeader from './AccountHeader';
import closedBook from '../abm-usuarios/assets/closed-book.png';
import mail from '../abm-usuarios/assets/mail.png';
import pencil from '../abm-usuarios/assets/pencil.png';

function Account() {
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    businessName: '',
    documentNumber: '',
    businessAddress: '',
    phoneNumber: '',
    startContract: '',
    endContract: '',
    isFreeCharge: false,
    activeProductivity: false,
    emailAddress: '',
    activeCopyInEmail: false,
    activeSaveShareDocuments: false,
    portalStatus: 1,
    firma: '',
    imagenFirma: null,
  });

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const data = await studyAPI.get();
      setFormData({
        businessName: data.businessName || '',
        documentNumber: data.documentNumber || '',
        businessAddress: data.businessAddress || '',
        phoneNumber: data.phoneNumber || '',
        startContract: data.startContract || '',
        endContract: data.endContract || '',
        isFreeCharge: data.isFreeCharge || false,
        activeProductivity: data.activeProductivity || false,
        emailAddress: data.emailAddress || '',
        activeCopyInEmail: data.activeCopyInEmail || false,
        activeSaveShareDocuments: data.activeSaveShareDocuments || false,
      });
    } catch (error) {
      console.error('Error al cargar datos de cuenta:', error);
      addToast('Error al cargar datos de cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        addToast('El archivo no debe superar los 3MB', 'error');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
        addToast('Solo se permiten archivos PNG, JPG o GIF', 'error');
        return;
      }
      setFormData(prev => ({ ...prev, imagenFirma: file }));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, imagenFirma: null }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      await studyAPI.update(formData);
      addToast('Datos actualizados correctamente', 'success');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      addToast('Error al actualizar datos', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <AccountHeader onSave={handleSave} />
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center justify-center gap-12 px-6 pb-20">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 pb-4 px-4 transition-colors ${
              currentStep === 1
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <img
              src={closedBook}
              alt="Información General"
              className="w-6 h-6"
            />
            <span className="text-sm font-normal">Información General</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 pb-4 px-4 transition-colors ${
              currentStep === 2
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <img src={mail} alt="Envío de Correos" className="w-6 h-6" />
            <span className="text-sm font-normal">Envío de Correos</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 pb-4 px-4 transition-colors ${
              currentStep === 3
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <img src={pencil} alt="Firma del Usuario" className="w-6 h-6" />
            <span className="text-sm font-normal">Firma del Usuario</span>
          </button>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6 w-[788px] mx-auto">
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <label className="block text-sm mb-2">
                  Nombre/Razón Social
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                  placeholder="+54 | "
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  CUIT
                </label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Inicio Contrato
                </label>
                <input
                  type="date"
                  value={formData.startContract}
                  onChange={(e) => handleInputChange('startContract', e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.businessAddress}
                  onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Vigencia Contrato
                </label>
                <input
                  type="date"
                  value={formData.endContract}
                  onChange={(e) => handleInputChange('endContract', e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] rounded-lg outline-none text-sm"
                />
              </div>
            </div>

            <hr className="my-8 border-gray-200" />

            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <label className="block text-sm mb-3">
                  Permisos generación de tareas
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.isFreeCharge}
                      onChange={() => handleInputChange('isFreeCharge', false)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">Carga libre</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.isFreeCharge}
                      onChange={() => handleInputChange('isFreeCharge', true)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">Sólo estandarizadas</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3">
                  Portal de Clientes
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.portalStatus === 1}
                      onChange={() => handleInputChange('portalStatus', 1)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">Habilitado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.portalStatus === 0}
                      onChange={() => handleInputChange('portalStatus', 0)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">Deshabilitado</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3">
                  Productividad
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.activeProductivity}
                      onChange={() => handleInputChange('activeProductivity', true)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.activeProductivity}
                      onChange={() => handleInputChange('activeProductivity', false)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-3">
                  Guardar documentos compartidos
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.activeSaveShareDocuments}
                      onChange={() => handleInputChange('activeSaveShareDocuments', true)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">Permanente</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.activeSaveShareDocuments}
                      onChange={() => handleInputChange('activeSaveShareDocuments', false)}
                      className="w-5 h-5 accent-blue-500"
                    />
                    <span className="text-sm">21 días</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <a href="#" className="text-blue-500 text-sm hover:underline">
                Ver Términos y Condiciones
              </a>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="flex justify-center">
            <div className="space-y-6 max-w-[350px]">
              <div>
                <label className="block text-sm mb-2">
                  Correo para hacer envíos:
                </label>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="habilitado"
                  checked={formData.activeCopyInEmail}
                  disabled
                  className="w-5 h-5 accent-blue-500"
                  style={{ opacity: 1 }}
                />
                <label htmlFor="habilitado" className="text-gray-600">
                  Habilitado
                </label>
              </div>

              <div className="bg-gray-50 pl-0 p-4 rounded-lg">
                <p className="text-sm mb-2">
                  Hacer una prueba configuración enviando un correo a la dirección ingresada:
                </p>
                <button 
                  className="text-blue-600 hover:underline flex items-center gap-2 text-sm"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Enviar correo de prueba
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="copiarCorreos"
                  checked={formData.activeSaveShareDocuments}
                  onChange={(e) => handleInputChange('activeSaveShareDocuments', e.target.checked)}
                  className="w-5 h-5 accent-blue-500"
                />
                <label htmlFor="copiarCorreos" className="cursor-pointer">
                  Copiar correos enviados
                </label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="flex justify-center">
            <div className="space-y-6 w-[772px]">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">
                    Escriba su firma <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.firma}
                    onChange={(e) => handleInputChange("firma", e.target.value)}
                    className="w-full h-48 px-4 py-3 rounded-lg bg-gray-100 outline-none resize-none text-center"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Previsualización</label>
                  <div className="w-full h-48 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                    {formData.firma ? (
                      <div className="text-center">
                        <p className="font-normal">{formData.firma}</p>
                        {formData.imagenFirma && (
                          <img
                            src={URL.createObjectURL(formData.imagenFirma)}
                            alt="Firma"
                            className="mt-4 max-h-20 mx-auto"
                          />
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">La firma aparecerá aquí</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  id="fileUploadAccount"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!formData.imagenFirma ? (
                  <>
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-blue-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    <label htmlFor="fileUploadAccount" className="cursor-pointer">
                      <span className="text-blue-600 hover:underline">
                        Subir imagen
                      </span>
                      <span className="text-gray-600"> o arrastrarla aquí</span>
                    </label>
                    <p className="text-gray-400 text-sm mt-2">
                      PNG, JPG o GIF (max. 3MB)
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-8 h-8 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <div className="text-left">
                        <p className="text-sm font-medium">
                          {formData.imagenFirma.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(formData.imagenFirma.size / 1024).toFixed(0)}kb •
                          Complete
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <svg
                          className="w-5 h-5 text-gray-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

export default Account;
