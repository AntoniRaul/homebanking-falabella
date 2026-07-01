import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarTarjetas } from '../services/tarjetaService';
import TarjetaCard from '../components/TarjetaCard';

export default function Tarjetas() {
    const { cliente } = useAuth();
    const [tarjetas, setTarjetas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await listarTarjetas(cliente.clienteId);
                setTarjetas(data);
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tus tarjetas.');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [cliente]);

    if (cargando) {
        return <div className="pantalla-carga">Cargando tus tarjetas...</div>;
    }

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Mis tarjetas de crédito</h1>
            {error && <p className="mensaje-error">{error}</p>}
            {tarjetas.length === 0 ? (
                <p className="mensaje-vacio">Aún no tienes tarjetas de crédito.</p>
            ) : (
                <div className="grid-tarjetas">
                    {tarjetas.map((tarjeta) => (
                        <TarjetaCard key={tarjeta.id} tarjeta={tarjeta} />
                    ))}
                </div>
            )}
        </div>
    );
}
