import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const [tipoDocumento, setTipoDocumento] = useState('DNI');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [clave, setClave] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!numeroDocumento || !clave) {
            setError('Ingresa tu documento y tu clave.');
            return;
        }

        setCargando(true);
        try {
            await login(tipoDocumento, numeroDocumento, clave);
            navigate('/dashboard');
        } catch (err) {
            const mensaje = err.response?.data?.mensaje || 'No pudimos iniciar tu sesión. Verifica tus datos.';
            setError(mensaje);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="pagina-login">
            <header className="login-topbar">
                <span>Falabella</span>
                <span>Viajes Falabella</span>
                <span>Seguros Falabella</span>
                <span>Sodimac</span>
                <span>Tottus</span>
                <span>Maestro</span>
            </header>

            <div className="login-contenedor">
                <div className="hb-logo">
                    <span className="hb-logo-dot" aria-hidden="true"></span>
                    <div className="hb-logo-text">
                        <strong>Banco</strong>
                        <span>Falabella</span>
                    </div>
                </div>

                <form className="login-card" onSubmit={handleSubmit}>
                    <h1>Banca Internet</h1>
                    <p className="login-subtitulo">Ingresa con tu documento y tu clave de internet.</p>

                    <label htmlFor="tipoDocumento">Tipo de documento</label>
                    <select
                        id="tipoDocumento"
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                    >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carnet Extranjería</option>
                    </select>

                    <label htmlFor="numeroDocumento">Número de documento</label>
                    <input
                        id="numeroDocumento"
                        type="text"
                        placeholder="Ingresa tu documento"
                        value={numeroDocumento}
                        onChange={(e) => setNumeroDocumento(e.target.value)}
                    />

                    <label htmlFor="clave">Clave Internet</label>
                    <input
                        id="clave"
                        type="password"
                        placeholder="Clave Internet"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                    />

                    {error && <p className="mensaje-error">{error}</p>}

                    <button type="submit" className="btn btn-primario" disabled={cargando}>
                        {cargando ? 'Ingresando...' : 'Ingresar'}
                    </button>

                    <Link to="#" className="link-recupera">
                        Recupera tu clave
                    </Link>

                    <hr />

                    <p className="login-registro">
                        ¿Aún no eres cliente? <Link to="/registro">Hazte Cliente</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
