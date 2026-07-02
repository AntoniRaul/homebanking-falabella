import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarCuentas } from '../services/cuentaService';
import { solicitarCredito } from '../services/creditoService';

const MONTO_MIN = 500;
const MONTO_MAX = 50000;

const formatearMoneda = (valor) => {
    const monto = Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `S/ ${monto}`;
};

export default function SolicitarCredito() {
    const { cliente } = useAuth();
    const [cuentas, setCuentas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [procesando, setProcesando] = useState(false);
    const [resultado, setResultado] = useState(null);

    const [cuentaId, setCuentaId] = useState('');
    const [monto, setMonto] = useState(5000);
    const [plazoMeses, setPlazoMeses] = useState(12);
    const [conSeguro, setConSeguro] = useState(false);
    const [ingresoNeto, setIngresoNeto] = useState('');
    const [gastosFamiliares, setGastosFamiliares] = useState('');
    const [cuotasSistema, setCuotasSistema] = useState('');

    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await listarCuentas(cliente.clienteId);
                setCuentas(data);
                if (data.length > 0) setCuentaId(String(data[0].id));
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tus cuentas.');
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, [cliente]);

    // El slider y el input numerico comparten el mismo estado "monto",
    // asi que se mantienen sincronizados automaticamente en ambos sentidos.
    const handleMontoSlider = (e) => setMonto(Number(e.target.value));
    const handleMontoInput = (e) => {
        const valor = e.target.value;
        setMonto(valor === '' ? '' : Number(valor));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResultado(null);

        if (!cuentaId) {
            setError('Selecciona la cuenta donde quieres recibir el desembolso.');
            return;
        }
        if (!monto || monto < MONTO_MIN) {
            setError(`El monto minimo a solicitar es ${formatearMoneda(MONTO_MIN)}.`);
            return;
        }
        if (!ingresoNeto || Number(ingresoNeto) <= 0) {
            setError('Ingresa tu ingreso neto mensual.');
            return;
        }

        setProcesando(true);
        try {
            const data = await solicitarCredito({
                clienteId: cliente.clienteId,
                cuentaId,
                montoSolicitado: monto,
                plazoMeses,
                conSeguroDesgravamen: conSeguro,
                ingresoNetoMensual: Number(ingresoNeto),
                gastosFamiliares: gastosFamiliares === '' ? 0 : Number(gastosFamiliares),
                cuotasSistemaFinanciero: cuotasSistema === '' ? 0 : Number(cuotasSistema),
            });
            setResultado(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.mensaje || 'No pudimos procesar tu solicitud.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return <div className="pantalla-carga">Cargando tus cuentas...</div>;
    }

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Solicitar Crédito Empresarial</h1>
            <p className="subtitulo-pagina">Elige cuánto necesitas y te decimos al instante si calificas.</p>

            {cuentas.length === 0 ? (
                <p className="mensaje-vacio">Necesitas al menos una cuenta para recibir el desembolso.</p>
            ) : (
                <div className="panel-doble">
                    <section className="panel">
                        <form onSubmit={handleSubmit} className="formulario">
                            <label htmlFor="cuenta">Cuenta de desembolso</label>
                            <select id="cuenta" value={cuentaId} onChange={(e) => setCuentaId(e.target.value)}>
                                {cuentas.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.tipoCuentaNombre} · N° {c.numeroCuenta}
                                    </option>
                                ))}
                            </select>

                            <label htmlFor="monto">¿Cuánto necesitas?</label>
                            <div className="monto-slider-valor">{formatearMoneda(monto || 0)}</div>
                            <input
                                type="range"
                                className="slider-monto"
                                min={MONTO_MIN}
                                max={MONTO_MAX}
                                step={50}
                                value={monto || MONTO_MIN}
                                onChange={handleMontoSlider}
                            />
                            <input
                                id="monto"
                                type="number"
                                min={MONTO_MIN}
                                step="0.01"
                                value={monto}
                                onChange={handleMontoInput}
                                className="monto-input-fino"
                            />

                            <label htmlFor="plazo">Plazo (meses)</label>
                            <select id="plazo" value={plazoMeses} onChange={(e) => setPlazoMeses(Number(e.target.value))}>
                                {[3, 6, 12, 18, 24, 36].map((p) => (
                                    <option key={p} value={p}>{p} meses</option>
                                ))}
                            </select>

                            <label className="checkbox-linea">
                                <input
                                    type="checkbox"
                                    checked={conSeguro}
                                    onChange={(e) => setConSeguro(e.target.checked)}
                                />
                                Contratar seguro de desgravamen (reduce la tasa)
                            </label>

                            <label htmlFor="ingreso">Ingreso neto mensual</label>
                            <input
                                id="ingreso"
                                type="number"
                                min="0"
                                step="0.01"
                                value={ingresoNeto}
                                onChange={(e) => setIngresoNeto(e.target.value)}
                                placeholder="0.00"
                            />

                            <label htmlFor="gastos">Gastos familiares mensuales (opcional)</label>
                            <input
                                id="gastos"
                                type="number"
                                min="0"
                                step="0.01"
                                value={gastosFamiliares}
                                onChange={(e) => setGastosFamiliares(e.target.value)}
                                placeholder="0.00"
                            />

                            <label htmlFor="cuotas">Cuotas que ya pagas en otras entidades (opcional)</label>
                            <input
                                id="cuotas"
                                type="number"
                                min="0"
                                step="0.01"
                                value={cuotasSistema}
                                onChange={(e) => setCuotasSistema(e.target.value)}
                                placeholder="0.00"
                            />

                            {error && <p className="mensaje-error">{error}</p>}

                            <button type="submit" className="btn btn-primario" disabled={procesando}>
                                {procesando ? 'Evaluando...' : 'Evaluar solicitud'}
                            </button>
                        </form>
                    </section>

                    <section className="panel">
                        {!resultado ? (
                            <p className="mensaje-vacio">El resultado de tu evaluación aparecerá aquí.</p>
                        ) : (
                            <ResultadoSolicitud resultado={resultado} />
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

function ResultadoSolicitud({ resultado }) {
    const claseEstado = `estado-badge estado-${resultado.estado.toLowerCase()}`;

    return (
        <div>
            <div className="tarjeta-item-header">
                <h2 className="titulo-seccion">Resultado</h2>
                <span className={claseEstado}>{resultado.estado.replaceAll('_', ' ')}</span>
            </div>
            <p className="descripcion-movimiento">{resultado.motivoResultado}</p>

            {resultado.estado !== 'RECHAZADA' && (
                <>
                    <div className="resumen-tarjeta" style={{ margin: '1rem 0' }}>
                        <div>
                            <span className="etiqueta">Monto aprobado</span>
                            <strong>{formatearMoneda(resultado.montoAprobado)}</strong>
                        </div>
                        <div>
                            <span className="etiqueta">Cuota mensual</span>
                            <strong>{formatearMoneda(resultado.cuotaMensual)}</strong>
                        </div>
                        <div>
                            <span className="etiqueta">TEA</span>
                            <strong>{(resultado.tea * 100).toFixed(2)}%</strong>
                        </div>
                        <div>
                            <span className="etiqueta">Plazo</span>
                            <strong>{resultado.plazoMeses} meses</strong>
                        </div>
                    </div>

                    <h3 className="titulo-seccion">Cronograma de pagos</h3>
                    <ul className="lista-movimientos">
                        {resultado.cronograma.map((c) => (
                            <li key={c.numeroCuota}>
                                <div>
                                    <strong>Cuota {c.numeroCuota}</strong>
                                    <span className="fecha-movimiento">{c.fechaVencimiento}</span>
                                </div>
                                <div className="montos-movimiento">
                                    {formatearMoneda(c.cuota)}
                                    <span className="saldo-posterior">Saldo: {formatearMoneda(c.saldoPosterior)}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}