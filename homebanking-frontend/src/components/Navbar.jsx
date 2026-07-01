import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const { cliente, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="hb-header">
            <div className="hb-topbar">
                <span>Falabella</span>
                <span>Viajes Falabella</span>
                <span>Seguros Falabella</span>
                <span>Sodimac</span>
                <span>Tottus</span>
                <span>Maestro</span>
            </div>

            <div className="hb-mainbar">
                <div className="hb-logo">
                    <span className="hb-logo-dot" aria-hidden="true"></span>
                    <div className="hb-logo-text">
                        <strong>Banco</strong>
                        <span>Falabella</span>
                    </div>
                </div>

                <nav className="hb-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'activo' : '')}>
                        Inicio
                    </NavLink>
                    <NavLink to="/cuentas" className={({ isActive }) => (isActive ? 'activo' : '')}>
                        Cuentas
                    </NavLink>
                    <NavLink to="/tarjetas" className={({ isActive }) => (isActive ? 'activo' : '')}>
                        Tarjetas de Crédito
                    </NavLink>
                    <NavLink to="/transferencias" className={({ isActive }) => (isActive ? 'activo' : '')}>
                        Transferencias
                    </NavLink>
                </nav>

                <div className="hb-usuario">
                    <span>Hola, {cliente?.nombres}</span>
                    <button type="button" className="btn btn-outline" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </header>
    );
}
