import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listarCuentas } from '../services/cuentaService';
import { historialPorCuenta, procesarTransaccion } from '../services/transaccionService';
import GraficoArea from '../components/GraficoArea';

const OPERACIONES = [
    { valor: 'DEPOSITO', etiqueta: 'Depositar' },
    { valor: 'RETIRO', etiqueta: 'Retirar' },
    { valor: 'TRANSFERENCIA', etiqueta: 'Transferir' },
];

const formatearMoneda = (valor, moneda) => {
    const simbolo = moneda === 'USD' ? 'US$' : 'S/';
    return `${simbolo} ${Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function CuentaDetalle() {
    const { id } = useParams();
    const { cliente } = useAuth();

    const [cuenta, setCuenta] = useState(null);
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [operacion, setOperacion] = useState('DEPOSITO');
    const [monto, setMonto] = useState('');
    const [cuentaDestino, setCuentaDestino] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mensajeOperacion, setMensajeOperacion] = useState('');
    const [procesando, setProcesando] = useState(false);

    const cargarDatos = useCallback(async () => {
        try {
            const [cuentas, historial] = await Promise.all([
                listarCuentas(cliente.clienteId),
                historialPorCuenta(id),
            ]);
            const cuentaActual = cuentas.find((c) => String(c.id) === String(id));
            setCuenta(cuentaActual || null);
            setMovimientos(historial);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar la información de la cuenta.');
        } finally {
            setCargando(false);
        }
    }, [cliente, id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar la pagina
        cargarDatos();
    }, [cargarDatos]);

    const handleOperacion = async (e) => {
        e.preventDefault();
        setMensajeOperacion('');
        setError('');

        const montoNumero = Number(monto);
        if (!montoNumero || montoNumero <= 0) {
            setError('Ingresa un monto válido, mayor a 0.');
            return;
        }
        if (operacion === 'TRANSFERENCIA' && !cuentaDestino) {
            setError('Ingresa el número de cuenta destino.');
            return;
        }

        setProcesando(true);
        try {
            const datos = {
                cuentaId: id,
                monto: montoNumero,
                tipo: operacion,
                descripcion,
            };
            if (operacion === 'TRANSFERENCIA') {
                datos.numeroCuentaDestino = cuentaDestino;
            }
            await procesarTransaccion(datos);
            setMensajeOperacion('Operación realizada con éxito.');
            setMonto('');
            setCuentaDestino('');
            setDescripcion('');
            await cargarDatos();
        } catch (err) {
            const mensaje = err.response?.data?.mensaje || 'No pudimos procesar la operación.';
            setError(mensaje);
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return <div className="pantalla-carga">Cargando cuenta...</div>;
    }

    if (!cuenta) {
        return <p className="mensaje-error">No encontramos esta cuenta.</p>;
    }

    // Orden cronológico ascendente para que el gráfico se lea de izquierda a derecha
    const datosEvolucion = [...movimientos]
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map((mov) => ({
            fecha: new Date(mov.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }),
            saldo: Number(mov.saldoPosterior),
        }));

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">{cuenta.tipoCuentaNombre}</h1>
            <p className="subtitulo-pagina">N° {cuenta.numeroCuenta}</p>
            <p className="saldo-grande">{formatearMoneda(cuenta.saldo, cuenta.moneda)}</p>

            <section className="panel">
                <h2 className="titulo-seccion">Evolución del saldo</h2>
                <GraficoArea
                    datos={datosEvolucion}
                    ejeX="fecha"
                    dataKey="saldo"
                    formatoTooltip={(valor) => formatearMoneda(valor, cuenta.moneda)}
                />
            </section>

            <div className="panel-doble">
                <section className="panel">
                    <h2 className="titulo-seccion">Operar</h2>
                    <form onSubmit={handleOperacion} className="formulario">
                        <label htmlFor="operacion">Tipo de operación</label>
                        <select id="operacion" value={operacion} onChange={(e) => setOperacion(e.target.value)}>
                            {OPERACIONES.map((op) => (
                                <option key={op.valor} value={op.valor}>
                                    {op.etiqueta}
                                </option>
                            ))}
                        </select>

                        {operacion === 'TRANSFERENCIA' && (
                            <>
                                <label htmlFor="cuentaDestino">Cuenta destino</label>
                                <input
                                    id="cuentaDestino"
                                    type="text"
                                    value={cuentaDestino}
                                    onChange={(e) => setCuentaDestino(e.target.value)}
                                    placeholder="N° de cuenta destino"
                                />
                            </>
                        )}

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
                        {mensajeOperacion && <p className="mensaje-exito">{mensajeOperacion}</p>}

                        <button type="submit" className="btn btn-primario" disabled={procesando}>
                            {procesando ? 'Procesando...' : 'Confirmar'}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <h2 className="titulo-seccion">Movimientos</h2>
                    {movimientos.length === 0 ? (
                        <p className="mensaje-vacio">Aún no hay movimientos en esta cuenta.</p>
                    ) : (
                        <ul className="lista-movimientos">
                            {movimientos.map((mov) => (
                                <li key={mov.id}>
                                    <div>
                                        <strong>{mov.tipo}</strong>
                                        <span className="fecha-movimiento">
                                            {new Date(mov.fecha).toLocaleString('es-PE')}
                                        </span>
                                        {mov.descripcion && <p className="descripcion-movimiento">{mov.descripcion}</p>}
                                    </div>
                                    <div className="montos-movimiento">
                                        <span>{formatearMoneda(mov.monto, cuenta.moneda)}</span>
                                        <span className="saldo-posterior">
                                            Saldo: {formatearMoneda(mov.saldoPosterior, cuenta.moneda)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}
