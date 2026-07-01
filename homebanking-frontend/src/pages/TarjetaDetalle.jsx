import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listarTarjetas } from '../services/tarjetaService';
import { listarCuentas } from '../services/cuentaService';
import { historialPorTarjeta, procesarTransaccion } from '../services/transaccionService';
import GraficoPastel from '../components/GraficoPastel';

const formatearMonto = (valor) =>
    `S/ ${Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TarjetaDetalle() {
    const { id } = useParams();
    const { cliente } = useAuth();

    const [tarjeta, setTarjeta] = useState(null);
    const [cuentas, setCuentas] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensajeOperacion, setMensajeOperacion] = useState('');
    const [procesando, setProcesando] = useState(false);

    // Formulario de pago
    const [cuentaOrigenPagoId, setCuentaOrigenPagoId] = useState('');
    const [montoPago, setMontoPago] = useState('');

    // Formulario de consumo (simulación de compra)
    const [montoConsumo, setMontoConsumo] = useState('');
    const [descripcionConsumo, setDescripcionConsumo] = useState('');

    const cargarDatos = useCallback(async () => {
        try {
            const [tarjetas, cuentasCliente, historial] = await Promise.all([
                listarTarjetas(cliente.clienteId),
                listarCuentas(cliente.clienteId),
                historialPorTarjeta(id),
            ]);
            const tarjetaActual = tarjetas.find((t) => String(t.id) === String(id));
            setTarjeta(tarjetaActual || null);
            setCuentas(cuentasCliente);
            setMovimientos(historial);
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar la información de la tarjeta.');
        } finally {
            setCargando(false);
        }
    }, [cliente, id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar la pagina
        cargarDatos();
    }, [cargarDatos]);

    const handlePago = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeOperacion('');

        const monto = Number(montoPago);
        if (!cuentaOrigenPagoId) {
            setError('Selecciona la cuenta desde la cual pagarás.');
            return;
        }
        if (!monto || monto <= 0) {
            setError('Ingresa un monto válido, mayor a 0.');
            return;
        }

        setProcesando(true);
        try {
            await procesarTransaccion({
                tarjetaId: id,
                cuentaOrigenPagoId,
                monto,
                tipo: 'PAGO_TARJETA',
                descripcion: 'Pago de tarjeta de crédito',
            });
            setMensajeOperacion('Pago realizado con éxito.');
            setMontoPago('');
            await cargarDatos();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No pudimos procesar el pago.');
        } finally {
            setProcesando(false);
        }
    };

    const handleConsumo = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeOperacion('');

        const monto = Number(montoConsumo);
        if (!monto || monto <= 0) {
            setError('Ingresa un monto válido, mayor a 0.');
            return;
        }

        setProcesando(true);
        try {
            await procesarTransaccion({
                tarjetaId: id,
                monto,
                tipo: 'CONSUMO_TARJETA',
                descripcion: descripcionConsumo || 'Consumo con tarjeta',
            });
            setMensajeOperacion('Consumo registrado con éxito.');
            setMontoConsumo('');
            setDescripcionConsumo('');
            await cargarDatos();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No pudimos registrar el consumo.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return <div className="pantalla-carga">Cargando tarjeta...</div>;
    }

    if (!tarjeta) {
        return <p className="mensaje-error">No encontramos esta tarjeta.</p>;
    }

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Tarjeta de Crédito</h1>
            <p className="subtitulo-pagina">{tarjeta.numeroTarjetaEnmascarado}</p>

            <div className="resumen-tarjeta">
                <div>
                    <span className="etiqueta">Línea de crédito</span>
                    <strong>{formatearMonto(tarjeta.lineaCredito)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Deuda actual</span>
                    <strong>{formatearMonto(tarjeta.deudaActual)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Línea disponible</span>
                    <strong>{formatearMonto(tarjeta.lineaDisponible)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Corte / Pago</span>
                    <strong>Día {tarjeta.fechaCorte} / {tarjeta.fechaPago}</strong>
                </div>
            </div>

            {error && <p className="mensaje-error">{error}</p>}
            {mensajeOperacion && <p className="mensaje-exito">{mensajeOperacion}</p>}

            <section className="panel">
                <h2 className="titulo-seccion">Uso de tu línea de crédito</h2>
                <GraficoPastel
                    datos={[
                        { nombre: 'Deuda actual', valor: Number(tarjeta.deudaActual) },
                        { nombre: 'Línea disponible', valor: Number(tarjeta.lineaDisponible) },
                    ]}
                    dona
                    colores={['#c0392b', '#4CA82F']}
                    formatoTooltip={(valor) => formatearMonto(valor)}
                />
            </section>

            <div className="panel-triple">
                <section className="panel">
                    <h2 className="titulo-seccion">Pagar tarjeta</h2>
                    <form onSubmit={handlePago} className="formulario">
                        <label htmlFor="cuentaOrigen">Pagar desde</label>
                        <select
                            id="cuentaOrigen"
                            value={cuentaOrigenPagoId}
                            onChange={(e) => setCuentaOrigenPagoId(e.target.value)}
                        >
                            <option value="">Selecciona una cuenta</option>
                            {cuentas.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.tipoCuentaNombre} · N° {c.numeroCuenta}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="montoPago">Monto a pagar</label>
                        <input
                            id="montoPago"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={montoPago}
                            onChange={(e) => setMontoPago(e.target.value)}
                            placeholder="0.00"
                        />

                        <button type="submit" className="btn btn-primario" disabled={procesando}>
                            {procesando ? 'Procesando...' : 'Pagar'}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <h2 className="titulo-seccion">Simular consumo</h2>
                    <form onSubmit={handleConsumo} className="formulario">
                        <label htmlFor="montoConsumo">Monto</label>
                        <input
                            id="montoConsumo"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={montoConsumo}
                            onChange={(e) => setMontoConsumo(e.target.value)}
                            placeholder="0.00"
                        />

                        <label htmlFor="descripcionConsumo">Descripción</label>
                        <input
                            id="descripcionConsumo"
                            type="text"
                            value={descripcionConsumo}
                            onChange={(e) => setDescripcionConsumo(e.target.value)}
                            placeholder="Ej: Compra en tienda"
                        />

                        <button type="submit" className="btn btn-outline" disabled={procesando}>
                            {procesando ? 'Procesando...' : 'Registrar consumo'}
                        </button>
                    </form>
                </section>

                <section className="panel">
                    <h2 className="titulo-seccion">Movimientos</h2>
                    {movimientos.length === 0 ? (
                        <p className="mensaje-vacio">Aún no hay movimientos en esta tarjeta.</p>
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
                                        <span>{formatearMonto(mov.monto)}</span>
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
