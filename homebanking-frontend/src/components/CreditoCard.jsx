import { Link } from 'react-router-dom';

const formatearMonto = (valor) =>
    `S/ ${Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CreditoCard({ credito }) {
    return (
        <Link to={`/creditos/${credito.id}`} className="tarjeta-item credito-item">
            <div className="tarjeta-item-header">
                <span className="tarjeta-item-tipo">Crédito Empresarial</span>
                <span className={`estado-badge estado-${credito.estado?.toLowerCase()}`}>{credito.estado}</span>
            </div>
            <p className="tarjeta-item-numero">{credito.cuotasPagadas} / {credito.plazoMeses} cuotas pagadas</p>

            <div className="tarjeta-item-linea">
                <div>
                    <span className="etiqueta">Saldo pendiente</span>
                    <strong>{formatearMonto(credito.saldoPendiente)}</strong>
                </div>
                <div>
                    <span className="etiqueta">Cuota mensual</span>
                    <strong>{formatearMonto(credito.cuotaMensual)}</strong>
                </div>
            </div>

            {credito.proximaCuota && (
                <p className="tarjeta-item-detalle">
                    Próxima cuota: {formatearMonto(credito.proximaCuota.cuota)} · vence {credito.proximaCuota.fechaVencimiento}
                </p>
            )}
        </Link>
    );
}