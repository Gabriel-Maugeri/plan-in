import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { securityAPI } from '../services/api';
import { encryptPassword } from '../utils/encryption';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

function PasswordExpired() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state || {};
  
  const [formData, setFormData] = useState({
    documentNumber: stateData.documentNumber || '',
    userName: stateData.userName || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { id: 'special', label: 'Mínimo un carácter especial', test: /[!@#$%^&*(),.?":{}|<>]/ },
    { id: 'uppercase', label: 'Mínimo una mayúscula', test: /[A-Z]/ },
    { id: 'lowercase', label: 'Mínimo una minúscula', test: /[a-z]/ },
    { id: 'number', label: 'Mínimo un número', test: /[0-9]/ },
  ];

  const getRuleMet = (ruleId) => {
    return passwordRules.find(r => r.id === ruleId)?.test.test(formData.newPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const allRulesMet = passwordRules.every(rule => rule.test.test(formData.newPassword));
    if (!allRulesMet) {
      setError('La contraseña no cumple con todos los requisitos');
      return;
    }

    setLoading(true);

    try {
      const encryptedCurrentPassword = encryptPassword(formData.currentPassword);
      const encryptedNewPassword = encryptPassword(formData.newPassword);

      await securityAPI.changePassword({
        documentNumber: formData.documentNumber,
        userName: formData.userName,
        password: encryptedCurrentPassword,
        newPassword: encryptedNewPassword,
        recaptchaToken: 'dummy-token'
      });

      navigate('/', { 
        state: { 
          toast: {
            type: 'success',
            message: 'Se ha actualizado su contraseña. Llegará al usuario por mail en unos minutos.'
          }
        } 
      });
    } catch (err) {
      setError('Error al cambiar la contraseña. Verifique sus datos e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-h-screen flex p-5">
      <div className="w-[45%] bg-black relative overflow-hidden rounded-[30px]">
        <img 
          src="/assets/images/login-image.png" 
          alt="Login" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="w-[55%] flex items-center justify-center bg-white px-16">
        <div className="w-full max-w-[745px]">
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/images/lock.png" 
              alt="Lock" 
              className="w-16 h-16"
            />
          </div>

          <h1 className="text-5xl font-normal text-[#5B5346] mb-8 text-center">
            Debes actualizar tu contraseña de acceso
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  CUIT
                </label>
                <input
                  type="text"
                  name="documentNumber"
                  placeholder='0-00000000-0'
                  value={formData.documentNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Ingresá contraseña actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#72BFDD] hover:text-[#5fa8c4]"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Ingresá nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#72BFDD] hover:text-[#5fa8c4]"
                  >
                    {showPasswords.new ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div></div>
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Repite nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder=""
                    required
                    className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#72BFDD] hover:text-[#5fa8c4]"
                  >
                    {showPasswords.confirm ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div></div>
              <div className="space-y-2 text-sm text-gray-600">
              {passwordRules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2">
                  {getRuleMet(rule.id) ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                  <span className={getRuleMet(rule.id) ? 'text-green-600' : ''}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
            </div>

            

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-normal hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-[#DADADA] text-gray-700 rounded-full font-normal hover:bg-[#C5C5C5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Blanqueando...' : 'Blanquear Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PasswordExpired;
