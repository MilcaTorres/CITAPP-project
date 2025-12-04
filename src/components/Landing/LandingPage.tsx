import { ArrowRight, BarChart3, LayoutDashboard, Package, ShieldCheck, Users } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blacl to-black flex flex-col font-sans text-gray-800">
            {/* Navbar */}
            <nav className="w-full px-6 py-4 flex justify-between items-center bg-black/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-600">
                        CITAPP
                    </span>
                </div>
                <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-full bg-red-500 text-white font-medium 
             hover:bg-red-600 transition-all shadow-md shadow-red-300 
             hover:shadow-red-400 flex items-center gap-2"
                >
                    Iniciar Sesión <ArrowRight className="w-4 h-4" />
                </Link>
            </nav>

            {/* Hero Section */}
            <header className="flex-1 flex bg-gray-900 backdrop-blur-md flex-col items-center justify-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                    <div className="absolute top-20 right-10 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-red-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl text-white md:text-7xl font-extrabold tracking-tight leading-tight">
                        Gestión Inteligente para <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-red-700 to-red-500">
                            Tu Negocio
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed">
                        Optimiza inventarios, administra personal y visualiza reportes en tiempo real.
                        Todo lo que necesitas en una sola plataforma moderna y segura.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link
                            to="/login"
                            className="px-8 py-4 rounded-full bg-white text-black text-lg font-semibold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            Comenzar Ahora
                        </Link>
                        <a
                            href="#features"
                            className="px-8 py-4 rounded-full bg-white text-gray-700 text-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
                        >
                            Ver Características
                        </a>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 bg-gray-900 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo bajo control</h2>
                        <p className="text-lg text-white max-w-2xl mx-auto">
                            Herramientas diseñadas para potenciar la productividad y reducir errores operativos.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Package className="w-8 h-8 text-blue-600" />}
                            title="Inventario en Tiempo Real"
                            description="Control total de stock, alertas de bajo inventario y gestión de productos simplificada."
                            color="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-purple-600" />}
                            title="Gestión de Personal"
                            description="Administra perfiles de empleados, roles y permisos de acceso de forma segura."
                            color="bg-purple-50"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-8 h-8 text-green-600" />}
                            title="Reportes Detallados"
                            description="Toma decisiones basadas en datos con reportes de ventas y rendimiento actualizados."
                            color="bg-green-50"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-orange-600" />}
                            title="Seguridad Avanzada"
                            description="Protección de datos y control de acceso basado en roles para administradores."
                            color="bg-orange-50"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-gray-300 py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-red-400" />
                        <span className="text-xl font-bold text-white">CITAPP</span>
                    </div>
                    <p className="text-sm text-black-500">
                        © {new Date().getFullYear()} CITAPP. Todos los derechos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
    <div className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);
