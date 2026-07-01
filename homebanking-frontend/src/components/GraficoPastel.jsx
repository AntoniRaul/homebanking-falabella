import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORES_DEFECTO = ['#4CA82F', '#2F6E2B', '#8FCB68', '#B7D334', '#1F5C3F', '#6FA83C'];

export default function GraficoPastel({ datos, dataKey = 'valor', nameKey = 'nombre', formatoTooltip, dona = false, colores }) {
    const paleta = colores || COLORES_DEFECTO;

    if (!datos || datos.length === 0) {
        return <p className="mensaje-vacio">No hay datos suficientes para graficar.</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={datos}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    cx="50%"
                    cy="50%"
                    innerRadius={dona ? 55 : 0}
                    outerRadius={95}
                    paddingAngle={2}
                >
                    {datos.map((entrada, index) => (
                        <Cell key={entrada[nameKey] || index} fill={paleta[index % paleta.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={formatoTooltip} />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    );
}
