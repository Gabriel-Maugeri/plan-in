import { useState, useEffect } from "react";
import { usersAPI, rolesAPI, senioritiesAPI } from "../services/api";
import closedBook from "../assets/closed-book.png";
import mail from "../assets/mail.png";
import pencil from "../assets/pencil.png";

function EditUserModal({ isOpen, onClose, userData, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombreApellido: "",
    usuarioAcceso: "",
    correoUsuario: "",
    rol: null,
    seniority: null,
    estadoUsuario: "Activo",
    correoEnvios: "",
    habilitado: true,
    copiarCorreos: true,
    firma: "",
    imagenFirma: null,
  });
  const [errors, setErrors] = useState({});
  const [roles, setRoles] = useState([]);
  const [seniorities, setSeniorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  useEffect(() => {
    if (!isOpen || !userData) return;
    
    const loadData = async () => {
      try {
        const rolesData = await rolesAPI.getAll();
        setRoles(rolesData);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
      
      try {
        const senioritiesData = await senioritiesAPI.getAll();
        setSeniorities(senioritiesData);
      } catch (error) {
        console.error('Error al cargar seniorities:', error);
      }
      
      setFormData({
        nombreApellido: userData.businessName || "",
        usuarioAcceso: userData.userName || "",
        correoUsuario: userData.emailAddress || "",
        rol: userData.rol?.rolId || null,
        seniority: userData.seniority?.seniorityId || null,
        estadoUsuario: userData.isActive ? "Activo" : "Inactivo",
        correoEnvios: userData.emailAddressSend || "",
        habilitado: userData.isActive,
        copiarCorreos: userData.copyByEmail,
        firma: userData.signature || "",
        imagenFirma: null,
      });
    };
    
    loadData();
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const isValidEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmail = async (email, field) => {
    if (!email.trim()) return;
    
    if (!isValidEmailFormat(email)) {
      setErrors(prev => ({ ...prev, [field]: "Formato de correo inválido." }));
      return;
    }
    
    const originalEmail = userData?.emailAddress || '';
    if (email === originalEmail) {
      setErrors(prev => ({ ...prev, [field]: "" }));
      return;
    }
    
    try {
      setValidating(prev => ({ ...prev, [field]: true }));
      const exists = await usersAPI.emailExists(email);
      
      if (exists) {
        setErrors(prev => ({ ...prev, [field]: "Ya existe este correo." }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    } catch (error) {
      console.error('Error al validar email:', error);
    } finally {
      setValidating(prev => ({ ...prev, [field]: false }));
    }
  };
  
  const validateUserName = async (userName) => {
    if (!userName.trim()) return;
    
    const originalUserName = userData?.userName || '';
    if (userName === originalUserName) {
      setErrors(prev => ({ ...prev, usuarioAcceso: "" }));
      return;
    }
    
    try {
      setValidating(prev => ({ ...prev, usuarioAcceso: true }));
      const exists = await usersAPI.userExists(userName);
      
      if (exists) {
        setErrors(prev => ({ ...prev, usuarioAcceso: "Ya existe este usuario de acceso." }));
      } else {
        setErrors(prev => ({ ...prev, usuarioAcceso: "" }));
      }
    } catch (error) {
      console.error('Error al validar usuario:', error);
    } finally {
      setValidating(prev => ({ ...prev, usuarioAcceso: false }));
    }
  };

  const validateEmailSend = async (emailSend) => {
    if (!emailSend.trim()) {
      setFormData(prev => ({ ...prev, habilitado: false }));
      return false;
    }
    
    if (!isValidEmailFormat(emailSend)) {
      setErrors(prev => ({ ...prev, correoEnvios: "Formato de correo inválido." }));
      setFormData(prev => ({ ...prev, habilitado: false }));
      return false;
    }
    
    const originalEmailSend = userData?.emailAddressSend || '';
    if (emailSend === originalEmailSend) {
      setErrors(prev => ({ ...prev, correoEnvios: "" }));
      return true;
    }
    
    try {
      setValidating(prev => ({ ...prev, correoEnvios: true }));
      const exists = await usersAPI.emailSendExists(emailSend);
      setErrors(prev => ({ ...prev, correoEnvios: "" }));
      setFormData(prev => ({ ...prev, habilitado: exists }));
      return true;
    } catch (error) {
      console.error('Error al validar correo de envíos:', error);
      setFormData(prev => ({ ...prev, habilitado: false }));
      return false;
    } finally {
      setValidating(prev => ({ ...prev, correoEnvios: false }));
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleSendTestEmail = async () => {
    if (!formData.correoEnvios.trim()) {
      alert('Ingrese un correo de envíos primero');
      return;
    }
    
    const isValid = await validateEmailSend(formData.correoEnvios);
    if (!isValid) {
      alert('El correo de envíos ya está siendo utilizado. Ingrese otro correo.');
      return;
    }
    
    try {
      setLoading(true);
      await usersAPI.emailSendValid(formData.correoEnvios);
      showToastMessage('La información se compartió correctamente!');
    } catch (error) {
      console.error('Error al enviar correo de prueba:', error);
      alert('Error al enviar correo de prueba');
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step) => {
    setCurrentStep(step);
  };

  const hasErrors = () => {
    const hasBasicErrors = !formData.nombreApellido.trim() || 
                           !formData.usuarioAcceso.trim() || 
                           !formData.correoUsuario.trim() || 
                           !formData.rol ||
                           errors.correoUsuario || 
                           errors.usuarioAcceso || 
                           errors.correoEnvios;
    
    const hasEmailSendError = formData.correoEnvios.trim() && !formData.habilitado;
    
    return hasBasicErrors || hasEmailSendError;
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const selectedRole = roles.find(r => r.rolId === Number(formData.rol));
      
      const selectedSeniority = formData.seniority 
        ? seniorities.find(s => s.seniorityId === Number(formData.seniority))
        : null;
      
      let signatureComplete = formData.firma || '';
      
      if (formData.imagenFirma) {
        try {
          const imageBase64 = await fileToBase64(formData.imagenFirma);
          signatureComplete = signatureComplete + (signatureComplete ? '\n' : '') + imageBase64;
        } catch (error) {
          console.error('Error al convertir imagen a base64:', error);
        }
      }
      
      const updatedUserData = {
        userId: userData.userId,
        userSubId: userData.userSubId,
        userName: formData.usuarioAcceso,
        businessName: formData.nombreApellido,
        rol: selectedRole ? {
          rolId: selectedRole.rolId,
          rolName: selectedRole.rolName,
        } : null,
        seniority: selectedSeniority,
        emailAddress: formData.correoUsuario,
        emailAddressSend: formData.correoEnvios || null,
        isActive: formData.habilitado,
        copyByEmail: formData.copiarCorreos,
        signature: signatureComplete || null,
      };
      
      console.log('Actualizando usuario:', updatedUserData);
      
      await usersAPI.update(updatedUserData);
      handleClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      showToastMessage('Error al actualizar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setErrors({});
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, imagenFirma: file }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, imagenFirma: null }));
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#27353E2E] z-30"
        onClick={handleClose}
      />
      <div className="flex flex-col justify-between fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-40 w-[960px] h-[740px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <h2 className="text-3xl font-normal mb-8 text-center">
          Modificar Usuario
        </h2>

        <div className="h-[582px]">
        {/* Tabs clickeables */}
        <div className="flex items-center justify-center gap-12 p-6 pt-4">
          {/* Tab 1 */}
          <button
            onClick={() => handleStepClick(1)}
            className={`flex items-center gap-2 pb-4 px-4 transition-colors ${
              currentStep === 1
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <img src={closedBook} alt="Información General" className="w-6 h-6" />
            <span className="text-sm font-normal">Información General</span>
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => handleStepClick(2)}
            className={`flex items-center gap-2 pb-4 px-4 transition-colors ${
              currentStep === 2
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <img src={mail} alt="Envío de Correos" className="w-6 h-6" />
            <span className="text-sm font-normal">Envío de Correos</span>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => handleStepClick(3)}
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

        {/* Step 1: Información General */}
        {currentStep === 1 && (
          <div className="space-y-6 px-22 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={formData.nombreApellido}
                  onChange={(e) =>
                    handleInputChange("nombreApellido", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={formData.correoUsuario}
                  onChange={(e) =>
                    handleInputChange("correoUsuario", e.target.value)
                  }
                  onBlur={(e) => validateEmail(e.target.value, "correoUsuario")}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none ${
                    errors.correoUsuario ? "border-2 border-red-500" : ""
                  }`}
                />
                {validating.correoUsuario && (
                  <p className="text-gray-500 text-sm mt-1">Validando...</p>
                )}
                {errors.correoUsuario && !validating.correoUsuario && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.correoUsuario}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                type="text"
                value={formData.usuarioAcceso}
                onChange={(e) =>
                  handleInputChange("usuarioAcceso", e.target.value)
                }
                onBlur={(e) => validateUserName(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none ${
                  errors.usuarioAcceso ? "border-2 border-red-500" : ""
                }`}
              />
              {validating.usuarioAcceso && (
                <p className="text-gray-500 text-sm mt-1">Validando...</p>
              )}
              {errors.usuarioAcceso && !validating.usuarioAcceso && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.usuarioAcceso}
                </p>
              )}
            </div>

            <div className="h-px bg-gray-300"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Rol</label>
                <div className="relative">
                  <select
                    value={formData.rol || ''}
                    onChange={(e) => handleInputChange("rol", parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map((rol) => (
                      <option key={rol.rolId} value={rol.rolId}>
                        {rol.rolName}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="currentColor"
                  >
                    <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2">Seniority</label>
                <div className="relative">
                  <select
                    value={formData.seniority || ''}
                    onChange={(e) =>
                      handleInputChange("seniority", e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Sin seniority asignado</option>
                    {seniorities.map((seniority) => (
                      <option key={seniority.seniorityId} value={seniority.seniorityId}>
                        {seniority.nameSeniority}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="currentColor"
                  >
                    <path d="M6 8L0 2L1.4 0.6L6 5.2L10.6 0.6L12 2L6 8Z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-3">Estado del Usuario</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="estadoUsuario"
                    value="Activo"
                    checked={formData.estadoUsuario === "Activo"}
                    onChange={(e) =>
                      handleInputChange("estadoUsuario", e.target.value)
                    }
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span>Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="estadoUsuario"
                    value="Inactivo"
                    checked={formData.estadoUsuario === "Inactivo"}
                    onChange={(e) =>
                      handleInputChange("estadoUsuario", e.target.value)
                    }
                    className="w-5 h-5 accent-blue-500"
                  />
                  <span>Inactivo</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Envío de Correos */}
        {currentStep === 2 && (
          <div className="flex justify-center">
            <div className="space-y-6 max-w-[350px]">
              <div>
                <label className="block text-sm mb-2">
                  Correo para hacer envíos:
                </label>
                <input
                  type="email"
                  value={formData.correoEnvios}
                  onChange={(e) =>
                    handleInputChange("correoEnvios", e.target.value)
                  }
                  onBlur={(e) => validateEmailSend(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg bg-gray-100 outline-none ${
                    errors.correoEnvios ? "border-2 border-red-500" : ""
                  }`}
                />
                {validating.correoEnvios && (
                  <p className="text-gray-500 text-sm mt-1">Validando...</p>
                )}
                {errors.correoEnvios && !validating.correoEnvios && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.correoEnvios}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="habilitado"
                  checked={formData.habilitado}
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
                  Hacer una prueba configuración enviando un correo a la
                  dirección ingresada:
                </p>
                <button 
                  onClick={handleSendTestEmail}
                  disabled={loading}
                  className="text-blue-600 hover:underline flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {loading ? 'Enviando...' : 'Enviar correo de prueba'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="copiarCorreos"
                  checked={formData.copiarCorreos}
                  onChange={(e) =>
                    handleInputChange("copiarCorreos", e.target.checked)
                  }
                  className="w-5 h-5 accent-blue-500"
                />
                <label htmlFor="copiarCorreos" className="cursor-pointer">
                  Copiar correos enviados
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Firma del Usuario */}
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
                  id="fileUploadEdit"
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
                    <label htmlFor="fileUploadEdit" className="cursor-pointer">
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

        {/* Botones */}
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={handleClose}
            className="flex-1 max-w-[180px] px-6 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || hasErrors()}
            className={`flex-1 max-w-[180px] px-6 py-2 rounded-full text-white font-normal ${
              (loading || hasErrors())
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#72BFDD] hover:bg-[#5fa8c4]'
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-4 z-50 bg-[#E8F5E9] rounded-lg px-4 py-3 flex items-center gap-3 shadow-lg">
          <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="text-gray-800">{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default EditUserModal;
