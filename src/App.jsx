import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import ABMUsuarios from './pages/ABMUsuarios';
import ReporteProductividad from './pages/ReporteProductividad';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Login />} />
          <Route path="/abm/usuarios" element={<ABMUsuarios />} />
          <Route path="/reporte/productividad" element={<ReporteProductividad />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
