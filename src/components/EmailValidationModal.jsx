import { useState } from 'react';
import { securityAPI } from '../services/api';

function EmailValidationModal({ isOpen, onClose, userEmail }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResendLink = async () => {
    setLoading(true);
    try {
      await securityAPI.resendVerificationEmail({
        emailAddress: userEmail,
        recaptchaToken: 'dummy-token'
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error al reenviar verificación:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 w-[500px] p-8">
        <h2 className="text-xl font-normal text-gray-800 mb-4">
          Validación correo de envío
        </h2>
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">
          Debes validar tu correo electrónico para poder realizar envíos de tipo e-mail desde Plan In.
        </p>
        <p className="text-sm text-gray-700 mb-6 leading-relaxed">
          Para terminar el proceso, pinchá el enlace recibido desde info@plan-in.net. Si luego de unos minutos no recibís el correo, por favor revisá la carpeta de spam. Si aún así no lo recibís, por favor comunicate con nuestro área de sistemas al usuario enviando un correo a <span className="font-medium">soporte@plan-in.net</span>
        </p>
        <div className="flex justify-center">
          <button
            onClick={handleResendLink}
            disabled={loading || success}
            className="px-6 py-3 bg-[#72BFDD] text-white rounded-full font-normal hover:bg-[#5fa8c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : success ? 'Enlace enviado' : 'Solicitar el link'}
          </button>
        </div>
      </div>

      {success && (
        <div className="fixed top-4 left-4 bg-[#E8F5E9] px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
          <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span className="text-sm text-gray-800">
            Mail de verificación enviado. Verifique su bandeja de entrada en <span className="font-medium">{userEmail}</span>
          </span>
        </div>
      )}
    </>
  );
}

export default EmailValidationModal;
