import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { listarCuentas } from '../services/cuentaService';
import { listarTarjetas } from '../services/tarjetaService';
import { listarCreditos } from '../services/creditoService';
import CuentaCard from '../components/CuentaCard';
import TarjetaCard from '../components/TarjetaCard';
import CreditoCard from '../components/CreditoCard';
import GraficoPastel from '../components/GraficoPastel';
import GraficoBarras from '../components/GraficoBarras';

const formatearMoneda = (valor, moneda = 'PEN') => {
    const simbolo = moneda === 'USD' ? 'US$' : 'S/';
    return `${simbolo} ${Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function Dashboard() {
    const { cliente } = useAuth();
    const [cuentas, setCuentas] = useState([]);
    const [tarjetas, setTarjetas] = useState([]);
    const [creditos, setCreditos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [cuentasData, tarjetasData, creditosData] = await Promise.all([
                    listarCuentas(cliente.clienteId),
                    listarTarjetas(cliente.clienteId),
                    listarCreditos(cliente.clienteId),
                ]);
                setCuentas(cuentasData);
                setTarjetas(tarjetasData);
                setCreditos(creditosData);
            } catch (err) {
                console.error(err);
                setError('No pudimos cargar tu información. Intenta de nuevo más tarde.');
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [cliente]);

    if (cargando) {
        return <div className="pantalla-carga">Cargando tu información...</div>;
    }

    // ---- Datos derivados para los gráficos ----
    const cuentasPEN = cuentas.filter((c) => c.moneda === 'PEN' && Number(c.saldo) > 0);
    const cuentasUSD = cuentas.filter((c) => c.moneda === 'USD' && Number(c.saldo) > 0);

    const datosPastelCuentas = cuentasPEN.map((c) => ({
        nombre: `${c.tipoCuentaNombre} · ${c.numeroCuenta.slice(-4)}`,
        valor: Number(c.saldo),
    }));

    const totalPEN = cuentas
        .filter((c) => c.moneda === 'PEN')
        .reduce((acc, c) => acc + Number(c.saldo), 0);
    const totalUSD = cuentas
        .filter((c) => c.moneda === 'USD')
        .reduce((acc, c) => acc + Number(c.saldo), 0);
    const totalDeudaTarjetas = tarjetas.reduce((acc, t) => acc + Number(t.deudaActual), 0);
    const totalLineaDisponible = tarjetas.reduce((acc, t) => acc + Number(t.lineaDisponible), 0);
    const creditosVigentes = creditos.filter((c) => c.estado === 'VIGENTE');
    const totalDeudaCreditos = creditosVigentes.reduce((acc, c) => acc + Number(c.saldoPendiente), 0);

    const datosBarrasTarjetas = tarjetas.map((t) => ({
        nombre: t.numeroTarjetaEnmascarado.slice(-4),
        deuda: Number(t.deudaActual),
        disponible: Number(t.lineaDisponible),
    }));

    return (
        <div className="contenido-pagina">
            <h1 className="titulo-pagina">Hola, {cliente.nombres} 👋</h1>
            <p className="subtitulo-pagina">Este es el resumen de tus productos.</p>

            {error && <p className="mensaje-error">{error}</p>}

            {/* ---- Tarjetas de resumen rápido ---- */}
            <div className="resumen-tarjeta">
                <div>
                    <span className="etiqueta">Saldo total (soles)</span>
                    <strong>{formatearMoneda(totalPEN, 'PEN')}</strong>
                </div>
                {totalUSD > 0 && (
                    <div>
                        <span className="etiqueta">Saldo total (dólares)</span>
                        <strong>{formatearMoneda(totalUSD, 'USD')}</strong>
                    </div>
                )}
                <div>
                    <span className="etiqueta">Deuda en tarjetas</span>
                    <strong>{formatearMoneda(totalDeudaTarjetas, 'PEN')}</strong>
                </div>
                <div>
                    <span className="etiqueta">Línea disponible</span>
                    <strong>{formatearMoneda(totalLineaDisponible, 'PEN')}</strong>
                </div>
                <div>
                    <span className="etiqueta">Deuda en créditos</span>
                    <strong>{formatearMoneda(totalDeudaCreditos, 'PEN')}</strong>
                </div>
            </div>

            {/* ---- Gráficos ---- */}
            {(cuentas.length > 0 || tarjetas.length > 0) && (
                <div className="panel-doble">
                    <section className="panel">
                        <h2 className="titulo-seccion">Distribución de tu saldo por cuenta</h2>
                        <GraficoPastel
                            datos={datosPastelCuentas}
                            dona
                            formatoTooltip={(valor) => formatearMoneda(valor, 'PEN')}
                        />
                        {cuentasUSD.length > 0 && (
                            <p className="tarjeta-item-detalle">
                                * No incluye tus cuentas en dólares (US$ {totalUSD.toFixed(2)}).
                            </p>
                        )}
                    </section>

                    <section className="panel">
                        <h2 className="titulo-seccion">Deuda vs. línea disponible por tarjeta</h2>
                        <GraficoBarras
                            datos={datosBarrasTarjetas}
                            ejeX="nombre"
                            formatoTooltip={(valor) => formatearMoneda(valor, 'PEN')}
                            barras={[
                                { dataKey: 'deuda', nombre: 'Deuda actual', color: '#c0392b' },
                                { dataKey: 'disponible', nombre: 'Línea disponible', color: '#4CA82F' },
                            ]}
                        />
                    </section>
                </div>
            )}

            <section>
                <h2 className="titulo-seccion">Mis cuentas</h2>
                {cuentas.length === 0 ? (
                    <p className="mensaje-vacio">Aún no tienes cuentas registradas.</p>
                ) : (
                    <div className="grid-tarjetas">
                        {cuentas.map((cuenta) => (
                            <CuentaCard key={cuenta.id} cuenta={cuenta} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="titulo-seccion">Mis tarjetas de crédito</h2>
                {tarjetas.length === 0 ? (
                    <p className="mensaje-vacio">Aún no tienes tarjetas de crédito.</p>
                ) : (
                    <div className="grid-tarjetas">
                        {tarjetas.map((tarjeta) => (
                            <TarjetaCard key={tarjeta.id} tarjeta={tarjeta} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h2 className="titulo-seccion">Mis créditos</h2>
                {creditos.length === 0 ? (
                    <p className="mensaje-vacio">Aún no tienes créditos activos.</p>
                ) : (
                    <div className="grid-tarjetas">
                        {creditos.map((credito) => (
                            <CreditoCard key={credito.id} credito={credito} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}