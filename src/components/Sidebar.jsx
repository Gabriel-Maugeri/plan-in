import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Building2, Contact, BarChart3, Settings, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/abm/usuarios', label: 'Usuarios', icon: Users },
    { path: '/abm/clientes', label: 'Clientes', icon: Building2 },
    { path: '/abm/contactos', label: 'Contactos', icon: Contact },
    { path: '/reporte/productividad', label: 'Productividad', icon: BarChart3 },
    { path: '/account', label: 'Cuenta', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      className={`bg-[#424242] text-white h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-600">
        {!isCollapsed && <h1 className="text-xl font-semibold">Plan-In</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 transition-colors ${
                isActive(item.path) ? 'bg-gray-700 border-l-4 border-[#72BFDD]' : ''
              }`}
              title={isCollapsed ? item.label : ''}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-600 transition-colors"
          title={isCollapsed ? 'Cerrar Sesión' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
