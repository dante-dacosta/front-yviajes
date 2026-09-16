import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface Gasto {
    id: number;
    categoria: string;
    monto: string;
    descripcion: string;
}

interface Viaje {
    id: number;
    fecha: string;
    origen: string;
    destino: string;
    rate: string;
    empresa: string;
    gastos: Gasto[];
    total_gastos: number;
    ganancia_neta: number;
    monto_ahorro: number;
}

const ListaViajes = () => {
    const [viajes, setViajes] = useState<Viaje[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viajeExpandido, setViajeExpandido] = useState<number | null>(null);

    useEffect(() => {
        obtenerViajes();
    }, []);

    const obtenerViajes = async () => {
        try {
            const response = await api.get('/viajes/');
            setViajes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar la lista de viajes.');
            setLoading(false);
        }
    };

    const eliminarViaje = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este viaje y todos sus gastos?')) return;
        
        try {
            await api.delete(`/viajes/${id}/`);
            setViajes(viajes.filter(viaje => viaje.id !== id));
        } catch (err) {
            alert('Hubo un error al eliminar el viaje.');
        }
    };

    const toggleDetalles = (id: number) => {
        setViajeExpandido(viajeExpandido === id ? null : id);
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-900 text-gray-300">Cargando viajes...</div>;

    return (
        <div className="p-6 bg-gray-900 min-h-screen font-sans text-gray-100">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Historial de Viajes</h1>
                    <Link to="/nuevo-viaje" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow transition">
                        + Nuevo Viaje
                    </Link>
                </div>

                {error && <div className="bg-red-900/50 text-red-200 p-4 rounded mb-6">{error}</div>}

                {viajes.length === 0 && !error ? (
                    <div className="text-center text-gray-400 py-10 bg-gray-800 rounded-lg border border-gray-700">
                        No tienes viajes registrados aún.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {viajes.map((viaje) => (
                            <div key={viaje.id} className="bg-gray-800 rounded-lg shadow border border-gray-700 overflow-hidden">
                                <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded font-mono">{viaje.fecha}</span>
                                            <span className="font-semibold text-blue-400">{viaje.empresa}</span>
                                        </div>
                                        <h3 className="text-lg font-bold">{viaje.origen} ➔ {viaje.destino}</h3>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                                            <span>Rate: <span className="text-gray-200">${parseFloat(viaje.rate).toFixed(2)}</span></span>
                                            <span>Gastos: <span className="text-red-400">${viaje.total_gastos.toFixed(2)}</span></span>
                                            <span>Neto: <span className="text-green-400 font-bold">${viaje.ganancia_neta.toFixed(2)}</span></span>
                                            <span>Ahorro: <span className="text-blue-300 font-semibold">${parseFloat(viaje.monto_ahorro || 0).toFixed(2)}</span></span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <button onClick={() => toggleDetalles(viaje.id)} className="flex-1 md:flex-none bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm transition">
                                            {viajeExpandido === viaje.id ? 'Ocultar Gastos' : 'Ver Gastos'}
                                        </button>
                                        <Link to={`/editar-viaje/${viaje.id}`} className="flex-1 md:flex-none bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-700/50 px-4 py-2 rounded text-sm text-center transition">
                                            Editar
                                        </Link>
                                        <button onClick={() => eliminarViaje(viaje.id)} className="flex-1 md:flex-none bg-red-900/30 hover:bg-red-900/60 text-red-400 border border-red-800/50 px-4 py-2 rounded text-sm transition">
                                            Borrar
                                        </button>
                                    </div>
                                </div>

                                {viajeExpandido === viaje.id && (
                                    <div className="bg-gray-900/50 p-5 border-t border-gray-700">
                                        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Desglose de Gastos</h4>
                                        {viaje.gastos.length > 0 ? (
                                            <ul className="space-y-2">
                                                {viaje.gastos.map((gasto) => (
                                                    <li key={gasto.id} className="flex justify-between items-center text-sm bg-gray-800 p-2 rounded border border-gray-700">
                                                        <div>
                                                            <span className="font-medium text-gray-200">{gasto.categoria}</span>
                                                            {gasto.descripcion && <span className="text-gray-500 ml-2">({gasto.descripcion})</span>}
                                                        </div>
                                                        <span className="text-red-300 font-mono">${parseFloat(gasto.monto).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No hay gastos registrados.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListaViajes;