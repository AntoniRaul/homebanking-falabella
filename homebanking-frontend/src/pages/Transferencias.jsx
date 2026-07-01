import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarCuentas } from '../services/cuentaService';
import { procesarTransaccion } from '../services/transaccionService';

export default function Transferencias() {
    const { cliente } = useAuth();
    const [cuentas, setCuentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensajeExito, setMensajeExito] = useState('');
    const [procesando, setProcesando] = useState(false);

    const [cuentaOrigenId, setCuentaOrigenId] = useState('');
    const [cuentaDestino, setCuentaDestino] = useState('');
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await listarCuentas(cliente.clienteId);
                setCuentas(data);
                if (data.length > 0) {
                    setCuentaOrigenId(String(data[0].id));
                }
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tus cuentas.');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [cliente]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeExito('');

        const montoNumero = Number(monto);
        if (!cuentaOrigenId) {
            setError('Selecciona la cuenta de origen.');
            return;
        }
        if (!cuentaDestino) {
            setError('Ingresa el número de cuenta destino.');
            return;
        }
        if (!montoNumero || montoNumero <= 0) {
            setError('Ingresa un monto válido, mayor a 0.');
            return;
        }

        setProcesando(true);
        try {
            await procesarTransaccion({
                cuentaId: cuentaOrigenId,
                numeroCuentaDestino: cuentaDestino,
                monto: montoNumero,
                tipo: 'TRANSFERENCIA',
                descripcion,
            });
            setMensajeExito('Transferencia realizada con éxito.');
            setCuentaDestino('');
            setMonto('');
            setDescripcion('');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.mensaje || 'No pudimos procesar la transferencia.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return <div className="pantalla-carga">Cargando tus cuentas...</div>;
    }

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Transferencias</h1>
            <p className="subtitulo-pagina">Envía dinero a otra cuenta de forma rápida y segura.</p>

            {cuentas.length === 0 ? (
                <p className="mensaje-vacio">Necesitas al menos una cuenta para poder transferir.</p>
            ) : (
                <section className="panel panel-angosto">
                    <form onSubmit={handleSubmit} className="formulario">
                        <label htmlFor="cuentaOrigen">Cuenta de origen</label>
                        <select
                            id="cuentaOrigen"
                            value={cuentaOrigenId}
                            onChange={(e) => setCuentaOrigenId(e.target.value)}
                        >
                            {cuentas.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.tipoCuentaNombre} · N° {c.numeroCuenta} · {c.moneda} {c.saldo}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="cuentaDestino">Cuenta destino</label>
                        <input
                            id="cuentaDestino"
                            type="text"
                            value={cuentaDestino}
                            onChange={(e) => setCuentaDestino(e.target.value)}
                            placeholder="N° de cuenta destino"
                        />

                        <label htmlFor="monto">Monto</label>
                        <input
                            id="monto"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={monto}
                            onChange={(e) => setMonto(e.target.value)}
                            placeholder="0.00"
                        />

                        <label htmlFor="descripcion">Descripción (opcional)</label>
                        <input
                            id="descripcion"
                            type="text"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />

                        {error && <p className="mensaje-error">{error}</p>}
                        {mensajeExito && <p className="mensaje-exito">{mensajeExito}</p>}

                        <button type="submit" className="btn btn-primario" disabled={procesando}>
                            {procesando ? 'Procesando...' : 'Transferir'}
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
}
