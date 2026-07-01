import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function GraficoArea({ datos, ejeX, dataKey, formatoTooltip, color = '#4CA82F' }) {
    if (!datos || datos.length < 2) {
        return <p className="mensaje-vacio">Necesitas al menos dos movimientos para ver la evolución.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey={ejeX} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={formatoTooltip} />
                <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#colorSaldo)" />
            </AreaChart>
        </ResponsiveContainer>
    );
}
