import { X, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AccountHeader({ onSave }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <button>
            <ChevronLeft />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Datos de Cuenta
          </h1>

          <div className="flex items-center gap-4">
            <button
              onClick={onSave}
              className="flex items-center bg-[#72BFDD] rounded-full px-6 py-2 text-white text-base hover:bg-[#5fa8c4]"
            >
              Guardar cambios
            </button>
            <button
              onClick={handleLogout}
              className="hover:bg-gray-100 p-2 rounded-full"
              title="Cerrar sesión"
            >
              <X className="w-5 h-5"></X>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountHeader;
