import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    documentNumber: '',
    userName: '',
    password: '',
    country: 'AR',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login({
      documentNumber: formData.documentNumber,
      userName: formData.userName,
      password: formData.password,
      forceSingIn: true,
    });

    if (!result.success) {
      setError('Credenciales inválidas. Por favor, intenta nuevamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium mb-2">Plan-In</h1>
          <p className="text-gray-600">Gestión de Usuarios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* País */}
          <div>
            <label className="block text-sm font-medium mb-2">País</label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none"
            >
              <option value="AR">Argentina</option>
              <option value="UY">Uruguay</option>
              <option value="CL">Chile</option>
            </select>
          </div>

          {/* CUIT */}
          <div>
            <label className="block text-sm font-medium mb-2">CUIT</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              placeholder="20309471947"
              className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none"
              required
            />
          </div>

          {/* Usuario */}
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => handleInputChange('userName', e.target.value)}
              placeholder="marianita"
              className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 bg-gray-100 rounded-lg outline-none pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#72BFDD] text-white hover:bg-[#5fa8c4]'
            }`}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Información de prueba */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p className="font-medium mb-2">Credenciales de prueba:</p>
          <p>
            <strong>Supervisor:</strong> marianita / 123456
          </p>
          <p>
            <strong>Operador:</strong> luis / luis123
          </p>
          <p className="text-xs mt-2 text-gray-500">
            CUIT: 20309471947 | País: AR
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
