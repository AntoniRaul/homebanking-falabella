import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { listarCreditos, obtenerCronograma } from '../services/creditoService';
import { listarCuentas } from '../services/cuentaService';
import { procesarTransaccion } from '../services/transaccionService';

const formatearMonto = (valor) =>
    `S/ ${Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CreditoDetalle() {
    const { id } = useParams();
    const { cliente } = useAuth();

    const [credito, setCredito] = useState(null);
    const [cronograma, setCronograma] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [mensajeOperacion, setMensajeOperacion] = useState('');
    const [procesando, setProcesando] = useState(false);

    const [cuentaPagoId, setCuentaPagoId] = useState('');

    const cargarDatos = useCallback(async () => {
        try {
            const [creditos, cronogramaData, cuentasCliente] = await Promise.all([
                listarCreditos(cliente.clienteId),
                obtenerCronograma(id),
                listarCuentas(cliente.clienteId),
            ]);
            const creditoActual = creditos.find((c) => String(c.id) === String(id));
            setCredito(creditoActual || null);
            setCronograma(cronogramaData);
            setCuentas(cuentasCliente);
            if (cuentasCliente.length > 0) setCuentaPagoId(String(cuentasCliente[0].id));
        } catch (err) {
            console.error(err);
            setError('No pudimos cargar la información del crédito.');
        } finally {
            setCargando(false);
        }
    }, [cliente, id]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos al montar la pagina
        cargarDatos();
    }, [cargarDatos]);

    const proximaCuota = cronograma.find((c) => c.estado === 'PENDIENTE');

    const handlePago = async (e) => {
        e.preventDefault();
        setError('');
        setMensajeOperacion('');

        if (!cuentaPagoId) {
            setError('Selecciona la cuenta desde la cual pagarás.');
            return;
        }
        if (!proximaCuota) {
            setError('Este crédito no tiene cuotas pendientes.');
            return;
        }

        setProcesando(true);
        try {
            await procesarTransaccion({
                creditoId: id,
                cuentaId: cuentaPagoId,
                monto: proximaCuota.cuota,
                tipo: 'PAGO_CREDITO',
                descripcion: `Pago cuota ${proximaCuota.numeroCuota} de crédito`,
            });
            setMensajeOperacion('Cuota pagada con éxito.');
            await cargarDatos();
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No pudimos procesar el pago.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return <div className="pantalla-carga">Cargando crédito...</div>;
    }

    if (!credito) {
        return <p className="mensaje-error">No encontramos este crédito.</p>;
    }

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Crédito Empresarial</h1>
            <p className="subtitulo-pagina">
                <span className={`estado-badge estado-${credito.estado?.toLowerCase()}`}>{credito.estado}</span>
            </p>

            <div className="resumen-tarjeta">
                <div>
                    <span className="etiqueta">Monto aprobado</span>
                    <strong>{formatearMonto(credito.montoAprobado)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Saldo pendiente</span>
                    <strong>{formatearMonto(credito.saldoPendiente)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Cuota mensual</span>
                    <strong>{formatearMonto(credito.cuotaMensual)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Cuotas pagadas</span>
                    <strong>{credito.cuotasPagadas} / {credito.plazoMeses}</strong>
                </div>
                <div>
                    <span className="etiqueta">TEA</span>
                    <strong>{(credito.tea * 100).toFixed(2)}%</strong>
                </div>
            </div>

            {error && <p className="mensaje-error">{error}</p>}
            {mensajeOperacion && <p className="mensaje-exito">{mensajeOperacion}</p>}

            <div className="panel-doble">
                <section className="panel">
                    <h2 className="titulo-seccion">
                        {credito.estado === 'PAGADO' ? 'Crédito liquidado' : 'Pagar próxima cuota'}
                    </h2>

                    {credito.estado === 'PAGADO' ? (
                        <p className="mensaje-exito">Ya pagaste todas las cuotas de este crédito. 🎉</p>
                    ) : !proximaCuota ? (
                        <p className="mensaje-vacio">No hay cuotas pendientes.</p>
                    ) : (
                        <form onSubmit={handlePago} className="formulario">
                            <p className="descripcion-movimiento">
                                Cuota {proximaCuota.numeroCuota} de {credito.plazoMeses} · vence el {proximaCuota.fechaVencimiento}
                            </p>
                            <p className="monto-slider-valor">{formatearMonto(proximaCuota.cuota)}</p>

                            <label htmlFor="cuentaPago">Pagar desde</label>
                            <select
                                id="cuentaPago"
                                value={cuentaPagoId}
                                onChange={(e) => setCuentaPagoId(e.target.value)}
                            >
                                {cuentas.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.tipoCuentaNombre} · N° {c.numeroCuenta} · S/ {c.saldo}
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="btn btn-primario" disabled={procesando}>
                                {procesando ? 'Procesando...' : `Pagar cuota ${formatearMonto(proximaCuota.cuota)}`}
                            </button>
                        </form>
                    )}
                </section>

                <section className="panel">
                    <h2 className="titulo-seccion">Cronograma completo</h2>
                    <ul className="lista-movimientos">
                        {cronograma.map((c) => (
                            <li key={c.numeroCuota}>
                                <div>
                                    <strong>Cuota {c.numeroCuota}</strong>
                                    <span className="fecha-movimiento">{c.fechaVencimiento} · {c.estado}</span>
                                </div>
                                <div className="montos-movimiento">
                                    {formatearMonto(c.cuota)}
                                    <span className="saldo-posterior">Saldo: {formatearMonto(c.saldoPosterior)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}