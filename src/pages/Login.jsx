import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    documentNumber: '',
    userName: '',
    password: '',
    country: 'AR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    } else {
      setError('Credenciales inválidas. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-gray-800 mb-2">Plan-In</h1>
          <p className="text-gray-500">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-lg outline-none focus:bg-gray-100 transition-colors"
            >
              <option value="AR">Argentina</option>
              <option value="UY">Uruguay</option>
              <option value="CL">Chile</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CUIT
            </label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="20309471947"
              required
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-lg outline-none focus:bg-gray-100 transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="usuario"
              required
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-lg outline-none focus:bg-gray-100 transition-colors"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                required
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-lg outline-none focus:bg-gray-100 transition-colors pr-12"
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
            <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#72BFDD] text-white rounded-lg font-medium hover:bg-[#5fa8c4] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2">Credenciales de prueba:</p>
          <p><strong>Supervisor:</strong> marianita / 123456</p>
          <p><strong>Operador:</strong> luis / luis123</p>
          <p className="text-xs mt-2 text-gray-500">
            CUIT: 20309471947 | País: AR
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
