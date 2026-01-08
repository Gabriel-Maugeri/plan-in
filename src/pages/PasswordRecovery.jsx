import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { securityAPI } from '../services/api';
import { AlertCircle } from 'lucide-react';

function PasswordRecovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await securityAPI.recoverPassword({
        emailAddress: email,
        recaptchaToken: 'dummy-token'
      });
      
      navigate('/', { state: { message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña.' } });
    } catch (err) {
      setError('El correo ingresado no corresponde a un usuario registrado en el sistema. Contacte a soporte@plan-in.net');
    } finally {
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
        <div className="w-full max-w-[520px]">
          <div className="flex justify-center mb-6">
            <img 
              src="/assets/images/lock.png" 
              alt="Lock" 
              className="w-16 h-16"
            />
          </div>

          <h1 className="text-5xl font-normal text-[#5B5346] mb-4 text-center">
            Recuperar usuario y contraseña
          </h1>

          <p className="text-xl text-[#000000DE] text-center mb-8">
            Ingrese su correo electrónico y le enviaremos los<br /> datos de acceso para acceder a la plataforma:
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center gap-6">
            <div className='w-[350px] mx-auto'>
              <label className="block text-sm font-normal text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder=""
                required
                className={`w-full px-4 py-3 bg-[#F5F5F5] border-2 rounded-lg outline-none focus:bg-[#EBEBEB] transition-colors ${
                  error ? 'border-red-500' : 'border-transparent'
                }`}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">
                    El correo ingresado no corresponde a un usuario registrado en el sistema.
                  </p>
                  <p>
                    Contacte a <span className="underline">soporte@plan-in.net</span>
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className={`w-[350px] py-3.5 rounded-full font-normal transition-colors ${
                email && !loading 
                  ? 'bg-[#72BFDD] text-white hover:bg-[#5fa8c4] cursor-pointer' 
                  : 'bg-[#DADADA] text-gray-700 cursor-not-allowed'
              }`}
            >
              {loading ? 'Enviando...' : 'Continuar'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default PasswordRecovery;
