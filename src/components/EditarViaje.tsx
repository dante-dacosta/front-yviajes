import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

interface GastoForm {
    id?: number;
    categoria: string;
    monto: string | number;
    descripcion: string;
}

const EditarViaje = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState('');
    const [porcentajeAhorro, setPorcentajeAhorro] = useState(10);

    const [viaje, setViaje] = useState({
        fecha: '',
        origen: '',
        destino: '',
        millas: '',
        rate: '',
        empresa: ''
    });

    const [gastos, setGastos] = useState<GastoForm[]>([]);
    const [gastosEliminados, setGastosEliminados] = useState<number[]>([]);

    const totalRate = parseFloat(viaje.rate) || 0;
    const totalGastos = gastos.reduce((acc, g) => acc + (parseFloat(g.monto as string) || 0), 0);
    const gananciaNeta = totalRate - totalGastos;
    const montoAhorro = gananciaNeta > 0 ? (gananciaNeta * porcentajeAhorro) / 100 : 0;

    useEffect(() => {
        const fetchViaje = async () => {
            try {
                const response = await api.get(`/viajes/${id}/`);
                const data = response.data;
                
                setViaje({
                    fecha: data.fecha,
                    origen: data.origen,
                    destino: data.destino,
                    millas: data.millas,
                    rate: data.rate,
                    empresa: data.empresa
                });
                setGastos(data.gastos);
                setLoading(false);
            } catch (err) {
                setError('No se pudo cargar la información del viaje.');
                setLoading(false);
            }
        };
        fetchViaje();
    }, [id]);

    const handleViajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setViaje({ ...viaje, [e.target.name]: e.target.value });
    };

    const agregarGasto = () => {
        setGastos([...gastos, { categoria: 'GASOLINA', monto: '', descripcion: '' }]);
    };

    const actualizarGasto = (index: number, campo: keyof GastoForm, valor: string) => {
        const nuevosGastos = [...gastos];
        nuevosGastos[index] = { ...nuevosGastos[index], [campo]: valor };
        setGastos(nuevosGastos);
    };

    const eliminarGasto = (index: number) => {
        const gastoA_eliminar = gastos[index];
        if (gastoA_eliminar.id) {
            setGastosEliminados([...gastosEliminados, gastoA_eliminar.id]);
        }
        setGastos(gastos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);
        setError('');

        try {
            await api.put(`/viajes/${id}/`, {
                ...viaje,
                millas: parseFloat(viaje.millas as string),
                rate: parseFloat(viaje.rate as string),
                monto_ahorro: montoAhorro,
            });

            const promesasGastos = [];

            gastosEliminados.forEach(gastoId => {
                promesasGastos.push(api.delete(`/gastos/${gastoId}/`));
            });

            gastos.forEach(gasto => {
                if (gasto.id) {
                    promesasGastos.push(api.put(`/gastos/${gasto.id}/`, {
                        viaje: id,
                        categoria: gasto.categoria,
                        monto: parseFloat(gasto.monto as string),
                        descripcion: gasto.descripcion
                    }));
                } else {
                    promesasGastos.push(api.post(`/gastos/`, {
                        viaje: id,
                        categoria: gasto.categoria,
                        monto: parseFloat(gasto.monto as string),
                        descripcion: gasto.descripcion
                    }));
                }
            });

            await Promise.all(promesasGastos);
            navigate('/historial'); 
        } catch (err) {
            setError('Error al actualizar el viaje. Revisa los datos ingresados.');
            setGuardando(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">Cargando datos...</div>;

    return (
        <div className="p-6 bg-gray-900 min-h-screen font-sans">
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-yellow-500">Editar Viaje</h2>
                    <button onClick={() => navigate('/historial')} className="text-gray-400 hover:text-white transition">
                        Cancelar
                    </button>
                </div>

                {error && <div className="bg-red-900/50 text-red-200 p-3 rounded mb-6 text-sm border border-red-500">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 border-b border-gray-700 pb-2 mb-4">Detalles de la Carga</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Fecha</label>
                                <input type="date" name="fecha" value={viaje.fecha} onChange={handleViajeChange} required
                                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Empresa</label>
                                <input type="text" name="empresa" value={viaje.empresa} onChange={handleViajeChange} required
                                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Origen</label>
                                <input type="text" name="origen" value={viaje.origen} onChange={handleViajeChange} required
                                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Destino</label>
                                <input type="text" name="destino" value={viaje.destino} onChange={handleViajeChange} required
                                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Millas Totales</label>
                                <input type="number" step="0.1" name="millas" value={viaje.millas} onChange={handleViajeChange} required
                                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-300 text-sm font-bold mb-2">Rate ($)</label>
                                <input type="number" step="0.01" name="rate" value={viaje.rate} onChange={handleViajeChange} required
                                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                            <h3 className="text-lg font-semibold text-red-400">Gastos del Viaje</h3>
                            <button type="button" onClick={agregarGasto} className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 py-1 px-3 rounded transition">
                                + Agregar Gasto
                            </button>
                        </div>

                        <div className="space-y-4">
                            {gastos.map((gasto, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 bg-gray-900 p-4 rounded border border-gray-700 items-start md:items-end">
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-gray-400 text-xs font-bold mb-1">Categoría</label>
                                        <select 
                                            value={gasto.categoria} 
                                            onChange={(e) => actualizarGasto(index, 'categoria', e.target.value)}
                                            className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="GASOLINA">Gasolina</option>
                                            <option value="COMIDA">Comida</option>
                                            <option value="MANTENIMIENTO">Mantenimiento</option>
                                            <option value="ESTACIONAMIENTO">Estacionamiento</option>
                                            <option value="OTROS">Otros</option>
                                        </select>
                                    </div>
                                    <div className="w-full md:w-1/4">
                                        <label className="block text-gray-400 text-xs font-bold mb-1">Monto ($)</label>
                                        <input type="number" step="0.01" required value={gasto.monto} onChange={(e) => actualizarGasto(index, 'monto', e.target.value)}
                                            className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="w-full md:w-2/4">
                                        <label className="block text-gray-400 text-xs font-bold mb-1">Descripción</label>
                                        <input type="text" value={gasto.descripcion || ''} onChange={(e) => actualizarGasto(index, 'descripcion', e.target.value)}
                                            className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <button type="button" onClick={() => eliminarGasto(index)} className="w-full md:w-auto text-red-400 hover:text-red-300 font-bold py-2 px-3 bg-red-900/30 rounded border border-red-900 hover:bg-red-900/50 transition">
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-gray-900 p-4 rounded border border-gray-700">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-green-400">Meta de Ahorro Automático</h4>
                                <p className="text-xs text-gray-400">Separa un porcentaje de tu ganancia neta para este viaje.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <select 
                                    value={porcentajeAhorro} 
                                    onChange={(e) => setPorcentajeAhorro(Number(e.target.value))}
                                    className="bg-gray-700 text-gray-100 border border-gray-600 rounded py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={0}>No ahorrar</option>
                                    <option value={10}>10% de Ahorro</option>
                                    <option value={15}>15% de Ahorro</option>
                                    <option value={20}>20% de Ahorro</option>
                                    <option value={25}>25% de Ahorro</option>
                                    <option value={30}>30% de Ahorro</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-sm">
                            <span className="text-gray-300">Ganancia Neta Estimada: <strong className="text-gray-100">${gananciaNeta.toFixed(2)}</strong></span>
                            <span className="text-green-400">Ahorro Apartado ({porcentajeAhorro}%): <strong>${montoAhorro.toFixed(2)}</strong></span>
                        </div>
                    </div>

                    <button type="submit" disabled={guardando} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded transition disabled:opacity-50 mt-4 shadow-lg">
                        {guardando ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditarViaje;