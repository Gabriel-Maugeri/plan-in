import { useState } from "react";
import { Eye, EyeOff, Circle, CheckCircle2 } from "lucide-react";

function ChangePasswordModal({ isOpen, onClose, onConfirm, userData }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  if (!isOpen) return null;

  const validations = {
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
    hasLowerCase: /[a-z]/.test(formData.newPassword),
    hasUpperCase: /[A-Z]/.test(formData.newPassword),
    hasNumber: /\d/.test(formData.newPassword),
  };

  const allValidationsPassed = Object.values(validations).every(Boolean);
  const passwordsMatch =
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword === formData.confirmPassword;
  const canSubmit =
    formData.currentPassword &&
    allValidationsPassed &&
    passwordsMatch;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleConfirm = () => {
    if (canSubmit) {
      onConfirm(userData, formData.newPassword);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
    onClose();
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      {isValid ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <Circle className="w-4 h-4" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-[#27353E2E] z-30"
        onClick={handleClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 z-40 w-[560px] shadow-2xl">
        <h2 className="text-3xl font-normal mb-8 text-center">
          Modificar Contraseña
        </h2>

        <div className="space-y-6 mb-8">
          {/* Contraseña actual */}
          <div>
            <label className="block text-sm mb-2">
              Ingresa contraseña actual
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                placeholder="***********"
                className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.current ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm mb-2">
              Ingresa nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Repetir contraseña */}
          <div>
            <label className="block text-sm mb-2">Repite nueva contraseña</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Validaciones */}
          <div className="space-y-2 pt-2">
            <ValidationItem
              isValid={validations.hasSpecialChar}
              text="Mínimo un caracter especial"
            />
            <ValidationItem
              isValid={validations.hasLowerCase}
              text="Mínimo una minúscula"
            />
            <ValidationItem
              isValid={validations.hasUpperCase}
              text="Mínimo una mayúscula"
            />
            <ValidationItem
              isValid={validations.hasNumber}
              text="Mínimo un número"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleClose}
            className="flex-1 max-w-[180px] px-6 py-2 border-2 border-gray-400 rounded-full text-gray-700 hover:bg-gray-50 font-normal"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className={`flex-1 max-w-[180px] px-6 py-2 rounded-full font-normal ${
              canSubmit
                ? "bg-[#72BFDD] text-white hover:bg-[#5fa8c4]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Blanquear Contraseña
          </button>
        </div>
      </div>
    </>
  );
}

export default ChangePasswordModal;
