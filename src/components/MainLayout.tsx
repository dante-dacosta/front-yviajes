import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <nav className="bg-gray-950 border-b border-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0 font-bold text-xl text-blue-500 tracking-wider">
                            YViajes
                        </div>

                        <div className="flex space-x-4">
                            <Link
                                to="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                    isActive('/')
                                        ? 'bg-gray-800 text-blue-400 border border-gray-700'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/historial"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                                    isActive('/historial')
                                        ? 'bg-gray-800 text-blue-400 border border-gray-700'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                            >
                                Historial de Viajes
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="ml-4 bg-red-900/40 hover:bg-red-900/70 text-red-300 border border-red-800/60 px-3 py-2 rounded-md text-sm font-medium transition"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;