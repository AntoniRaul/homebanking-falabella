import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrar } from '../services/authService';

const FORM_INICIAL = {
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    clave: '',
};

export default function Registro() {
    const [form, setForm] = useState(FORM_INICIAL);
    const [error, setError] = useState('');
    const [exito, setExito] = useState(false);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.clave.length < 6) {
            setError('La clave debe tener al menos 6 caracteres.');
            return;
        }

        setCargando(true);
        try {
            await registrar(form);
            setExito(true);
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const mensaje = err.response?.data?.mensaje || 'No pudimos completar tu registro. Intenta nuevamente.';
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

                <form className="login-card registro-card" onSubmit={handleSubmit}>
                    <h1>Hazte Cliente</h1>
                    <p className="login-subtitulo">Completa tus datos para crear tu cuenta.</p>

                    <div className="fila-doble">
                        <div>
                            <label htmlFor="tipoDocumento">Tipo de documento</label>
                            <select
                                id="tipoDocumento"
                                name="tipoDocumento"
                                value={form.tipoDocumento}
                                onChange={handleChange}
                            >
                                <option value="DNI">DNI</option>
                                <option value="CE">Carnet Extranjería</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="numeroDocumento">N° de documento</label>
                            <input
                                id="numeroDocumento"
                                name="numeroDocumento"
                                type="text"
                                maxLength={12}
                                value={form.numeroDocumento}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="fila-doble">
                        <div>
                            <label htmlFor="nombres">Nombres</label>
                            <input id="nombres" name="nombres" type="text" value={form.nombres} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="apellidos">Apellidos</label>
                            <input
                                id="apellidos"
                                name="apellidos"
                                type="text"
                                value={form.apellidos}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <label htmlFor="email">Correo electrónico</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />

                    <label htmlFor="clave">Crea tu clave (mín. 6 caracteres)</label>
                    <input id="clave" name="clave" type="password" value={form.clave} onChange={handleChange} />

                    {error && <p className="mensaje-error">{error}</p>}
                    {exito && <p className="mensaje-exito">¡Registro exitoso! Redirigiendo al login...</p>}

                    <button type="submit" className="btn btn-primario" disabled={cargando}>
                        {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>

                    <hr />

                    <p className="login-registro">
                        ¿Ya eres cliente? <Link to="/login">Inicia sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
