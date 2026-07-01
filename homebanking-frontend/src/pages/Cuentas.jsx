import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarCuentas } from '../services/cuentaService';
import CuentaCard from '../components/CuentaCard';

export default function Cuentas() {
    const { cliente } = useAuth();
    const [cuentas, setCuentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await listarCuentas(cliente.clienteId);
                setCuentas(data);
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tus cuentas.');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [cliente]);

    if (cargando) {
        return <div className="pantalla-carga">Cargando tus cuentas...</div>;
    }

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Mis cuentas</h1>
            {error && <p className="mensaje-error">{error}</p>}
            {cuentas.length === 0 ? (
                <p className="mensaje-vacio">Aún no tienes cuentas registradas.</p>
            ) : (
                <div className="grid-tarjetas">
                    {cuentas.map((cuenta) => (
                        <CuentaCard key={cuenta.id} cuenta={cuenta} />
                    ))}
                </div>
            )}
        </div>
    );
}
