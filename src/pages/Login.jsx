import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import { Eye, EyeOff, ArrowRight, ChevronDown } from 'lucide-react';
import EmailValidationModal from '../components/EmailValidationModal';

const getFlagUrl = (countryCode) => {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
};

const COUNTRIES = [
  { code: 'AR', name: 'Argentina' },
];

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    documentNumber: '',
    userName: '',
    password: '',
    country: 'AR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailValidationModal, setShowEmailValidationModal] = useState(false);
  const [pendingUserEmail, setPendingUserEmail] = useState('');

  const selectedCountry = COUNTRIES.find(c => c.code === formData.country) || COUNTRIES[0];

  useEffect(() => {
    if (location.state?.toast) {
      addToast(location.state.toast.message, location.state.toast.type);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, addToast, navigate, location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleCountrySelect = (countryCode) => {
    setFormData(prev => ({ ...prev, country: countryCode }));
    setShowCountryDropdown(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const credentials = {
      ...formData,
      forceSingIn: true
    };

    const result = await login(credentials);
    
    if (result.success) {
      navigate('/abm/usuarios');
    } else if (result.passwordExpired) {
      navigate('/password-expired', { state: { documentNumber: formData.documentNumber, userName: formData.userName } });
    } else if (result.emailNotVerified) {
      setPendingUserEmail(result.email || '');
      setShowEmailValidationModal(true);
      setLoading(false);
    } else {
      setError(result.error || 'Credenciales inválidas. Por favor, intenta nuevamente.');
      setLoading(false);
    }
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
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-normal text-gray-800 mb-8 text-center">Bienvenido/a</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                País
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none flex items-center justify-between hover:bg-[#EBEBEB] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={getFlagUrl(selectedCountry.code)} 
                      alt={selectedCountry.name}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <span className="text-gray-800">{selectedCountry.name}</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </button>
                
                {showCountryDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowCountryDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountrySelect(country.code)}
                          className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors text-left"
                        >
                          <img 
                            src={getFlagUrl(country.code)} 
                            alt={country.name}
                            className="w-6 h-4 object-cover rounded"
                          />
                          <span className="text-gray-800">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                CUIT/CUIL
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder="0-00000000-0"
                required
                className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                placeholder=""
                required
                className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=""
                  required
                  className="w-full px-4 py-3 bg-[#F5F5F5] border-none rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/password-recovery')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Olvidé mis datos
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#72BFDD] text-white rounded-full font-normal hover:bg-[#5fa8c4] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>

      {showEmailValidationModal && (
        <EmailValidationModal
          isOpen={showEmailValidationModal}
          onClose={() => setShowEmailValidationModal(false)}
          userEmail={pendingUserEmail}
        />
      )}
    </div>
  );
}

export default Login;
