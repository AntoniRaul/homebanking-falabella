import { Link } from 'react-router-dom';

const formatearMonto = (valor) =>
    `S/ ${Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TarjetaCard({ tarjeta }) {
    return (
        <Link to={`/tarjetas/${tarjeta.id}`} className="tarjeta-item tarjeta-credito-item">
            <div className="tarjeta-item-header">
                <span className="tarjeta-item-tipo">Tarjeta de Crédito</span>
                <span className={`estado-badge estado-${tarjeta.estado?.toLowerCase()}`}>{tarjeta.estado}</span>
            </div>
            <p className="tarjeta-item-numero">{tarjeta.numeroTarjetaEnmascarado}</p>

            <div className="tarjeta-item-linea">
                <div>
                    <span className="etiqueta">Deuda actual</span>
                    <strong>{formatearMonto(tarjeta.deudaActual)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Línea disponible</span>
                    <strong>{formatearMonto(tarjeta.lineaDisponible)}</strong>
                </div>
            </div>

            <p className="tarjeta-item-detalle">
                Corte: día {tarjeta.fechaCorte} · Pago: día {tarjeta.fechaPago}
            </p>
        </Link>
    );
}
