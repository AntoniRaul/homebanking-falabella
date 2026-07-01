import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function GraficoBarras({ datos, ejeX, barras, formatoTooltip, alto = 280 }) {
    if (!datos || datos.length === 0) {
        return <p className="mensaje-vacio">No hay datos suficientes para graficar.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={alto}>
            <BarChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey={ejeX} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={formatoTooltip} />
                <Legend />
                {barras.map((barra) => (
                    <Bar key={barra.dataKey} dataKey={barra.dataKey} name={barra.nombre} fill={barra.color} radius={[6, 6, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
}
