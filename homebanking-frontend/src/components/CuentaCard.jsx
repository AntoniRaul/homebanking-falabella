import { Link } from 'react-router-dom';

const formatearMoneda = (valor, moneda) => {
    const simbolo = moneda === 'USD' ? 'US$' : 'S/';
    const monto = Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${simbolo} ${monto}`;
};

export default function CuentaCard({ cuenta }) {
    return (
        <Link to={`/cuentas/${cuenta.id}`} className="tarjeta-item cuenta-item">
            <div className="tarjeta-item-header">
                <span className="tarjeta-item-tipo">{cuenta.tipoCuentaNombre}</span>
                <span className={`estado-badge estado-${cuenta.estado?.toLowerCase()}`}>{cuenta.estado}</span>
            </div>
            <p className="tarjeta-item-numero">N° {cuenta.numeroCuenta}</p>
            <p className="tarjeta-item-saldo">{formatearMoneda(cuenta.saldo, cuenta.moneda)}</p>
            <p className="tarjeta-item-detalle">{cuenta.categoria}</p>
        </Link>
    );
}
