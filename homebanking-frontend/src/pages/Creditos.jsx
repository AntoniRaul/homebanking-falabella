import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listarCreditos } from '../services/creditoService';
import CreditoCard from '../components/CreditoCard';

export default function Creditos() {
    const { cliente } = useAuth();
    const [creditos, setCreditos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await listarCreditos(cliente.clienteId);
                setCreditos(data);
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tus créditos.');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [cliente]);

    if (cargando) {
        return <div className="pantalla-carga">Cargando tus créditos...</div>;
    }

    return (
        <div className="contenido-pagina">
            <div className="tarjeta-item-header">
                <h1 className="titulo-pagina">Mis créditos</h1>
                <Link to="/creditos/solicitar" className="btn btn-primario">Solicitar crédito</Link>
            </div>
            {error && <p className="mensaje-error">{error}</p>}
            {creditos.length === 0 ? (
                <p className="mensaje-vacio">Aún no tienes créditos activos.</p>
            ) : (
                <div className="grid-tarjetas">
                    {creditos.map((credito) => (
                        <CreditoCard key={credito.id} credito={credito} />
                    ))}
                </div>
            )}
        </div>
    );
}