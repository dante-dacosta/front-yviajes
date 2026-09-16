import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/axios';

interface ResumenFinanciero {
    total_ingresos: number;
    total_gastos: number;
    ganancia_neta: number;
    total_ahorro: number;
}

interface DatosGrafico {
    name: string;
    value: number;
}

interface DashboardData {
    periodo: { mes: number; anio: number };
    resumen_financiero: ResumenFinanciero;
    datos_grafico: DatosGrafico[];
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#A8E6CF', '#9B59B6', '#F7CAC9', '#92A8D1', '#F7786B'];

const MESES = [
    { valor: 1, nombre: 'Enero' }, { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' }, { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' }, { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' }, { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' }, { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' }, { valor: 12, nombre: 'Diciembre' }
];

const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());

    const aniosDisponibles = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await api.get('/dashboard/', {
                    params: {
                        mes: mesSeleccionado,
                        anio: anioSeleccionado
                    }
                });
                setData(response.data);
                setError('');
            } catch (err) {
                setError('No se pudo cargar la información del dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [mesSeleccionado, anioSeleccionado]); 

    if (loading && !data) return <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">Cargando métricas...</div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-gray-900 text-red-400">{error}</div>;
    if (!data) return null;

    const { resumen_financiero, datos_grafico } = data;
    const datosFiltrados = datos_grafico.filter(item => item.value > 0);

    return (
        <div className="p-6 bg-gray-900 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-gray-100">
                        Resumen de Operaciones
                    </h1>
                    
                    <div className="flex gap-3 bg-gray-800 p-2 rounded-lg shadow-md">
                        <select 
                            value={mesSeleccionado}
                            onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                            className="bg-gray-700 text-gray-200 border-none rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            {MESES.map(mes => (
                                <option key={mes.valor} value={mes.valor}>{mes.nombre}</option>
                            ))}
                        </select>
                        
                        <select 
                            value={anioSeleccionado}
                            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                            className="bg-gray-700 text-gray-200 border-none rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            {aniosDisponibles.map(anio => (
                                <option key={anio} value={anio}>{anio}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                            Ingresos Totales
                        </h3>
                        <p className="text-2xl font-bold text-gray-100 mt-2">
                            ${resumen_financiero.total_ingresos.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-400">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                            Gastos Totales
                        </h3>
                        <p className="text-2xl font-bold text-gray-100 mt-2">
                            ${resumen_financiero.total_gastos.toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-green-500">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                            Ganancia Neta
                        </h3>
                        <p className="text-2xl font-bold text-green-400 mt-2">
                            ${resumen_financiero.ganancia_neta.toFixed(2)}
                        </p>
                    </div>

                    {/* Nueva Tarjeta de Ahorro Acumulado */}
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-indigo-400">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                            Total Ahorrado
                        </h3>
                        <p className="text-2xl font-bold text-indigo-300 mt-2">
                            ${resumen_financiero.total_ahorro?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-100 mb-6">
                        Distribución de Gastos y Ganancias
                    </h3>
                    
                    <div className="h-80 w-full relative">
                        {loading && (
                            <div className="absolute inset-0 bg-gray-800/60 flex items-center justify-center z-10 rounded">
                                <span className="text-gray-300 font-medium">Actualizando...</span>
                            </div>
                        )}
                        
                        {datosFiltrados.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={datosFiltrados}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        stroke="#1f2937" 
                                    >
                                        {datosFiltrados.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => `$${value.toFixed(2)}`} 
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e5e7eb' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#d1d5db' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-gray-500">
                                No hay datos registrados en este periodo.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;