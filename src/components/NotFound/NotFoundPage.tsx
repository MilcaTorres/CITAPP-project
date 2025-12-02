import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Página no encontrada</h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Lo sentimos, la página que estás buscando no existe o ha sido movida.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                >
                    <Home className="w-4 h-4" />
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};
