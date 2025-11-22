import { ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Volver al Login</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200" />
                        <h1 className="text-xl font-bold text-gray-900">
                            CITAPP - Acceso Empleados
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}
