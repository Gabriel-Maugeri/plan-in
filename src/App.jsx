import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ToastContainer';
import Layout from './components/Layout';
import Login from './pages/Login';
import PasswordRecovery from './pages/PasswordRecovery';
import PasswordExpired from './pages/PasswordExpired';
import ABMUsuarios from './pages/ABMUsuarios';
import ABMContactos from './pages/ABMContactos';
import ABMClientes from './pages/ABMClientes';
import ReporteProductividad from './pages/ReporteProductividad';
import Account from './pages/Account';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth" element={<Login />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/password-expired" element={<PasswordExpired />} />
            <Route path="/abm/usuarios" element={<Layout><ABMUsuarios /></Layout>} />
            <Route path="/abm/contactos" element={<Layout><ABMContactos /></Layout>} />
            <Route path="/abm/clientes" element={<Layout><ABMClientes /></Layout>} />
            <Route path="/reporte/productividad" element={<Layout><ReporteProductividad /></Layout>} />
            <Route path="/account" element={<Layout><Account /></Layout>} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
