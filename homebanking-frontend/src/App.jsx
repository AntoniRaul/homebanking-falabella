import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LayoutHomeBanking from './components/LayoutHomeBanking';

import SolicitarCredito from './pages/SolicitarCredito';
import Creditos from './pages/Creditos';
import CreditoDetalle from './pages/CreditoDetalle';

import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Cuentas from './pages/Cuentas';
import CuentaDetalle from './pages/CuentaDetalle';
import Tarjetas from './pages/Tarjetas';
import TarjetaDetalle from './pages/TarjetaDetalle';
import Transferencias from './pages/Transferencias';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Rutas privadas (requieren sesion activa) */}
          <Route
            element={
              <PrivateRoute>
                <LayoutHomeBanking />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cuentas" element={<Cuentas />} />
            <Route path="/cuentas/:id" element={<CuentaDetalle />} />
            <Route path="/tarjetas" element={<Tarjetas />} />
            <Route path="/tarjetas/:id" element={<TarjetaDetalle />} />
            <Route path="/creditos" element={<Creditos />} />
            <Route path="/creditos/:id" element={<CreditoDetalle />} />
            <Route path="/creditos/solicitar" element={<SolicitarCredito />} />
            <Route path="/transferencias" element={<Transferencias />} />
          </Route>

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
