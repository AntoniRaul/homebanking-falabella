import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Envuelve las rutas que solo debe poder ver un cliente logueado.
// Si no hay sesion activa, redirige al login.
export default function PrivateRoute({ children }) {
    const { estaAutenticado, cargando } = useAuth();

    if (cargando) {
        return <div className="pantalla-carga">Cargando...</div>;
    }

    if (!estaAutenticado) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
