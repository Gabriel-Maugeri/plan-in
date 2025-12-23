import { useAuth } from '../context/AuthContext';
import { FilterProvider } from '../abm-usuarios/context/FilterContext';
import Header from '../abm-usuarios/components/Header';
import UsersTable from '../abm-usuarios/components/UsersTable';

function ABMUsuarios() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No se encontró sesión activa</p>
          <p className="text-gray-500 text-sm">Por favor, inicia sesión primero</p>
        </div>
      </div>
    );
  }

  return (
    <FilterProvider>
      <div className="flex flex-col">
        <Header />
        <UsersTable />
      </div>
    </FilterProvider>
  );
}

export default ABMUsuarios;
