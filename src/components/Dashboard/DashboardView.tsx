import { useState, useEffect } from "react";
import { Package, CheckCircle } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

export function DashboardView() {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosDisponibles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const { data: productos, error } = await supabase
          .from("productos")
          .select("cantidad");

        if (error) throw error;

        if (productos) {
          const total = productos.length;
          const disponibles = productos.filter((p) => p.cantidad > 0).length;
          setStats({
            totalProductos: total,
            productosDisponibles: disponibles,
          });
        }
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-gray-500 text-lg animate-pulse">
          {t("dashboard.loadingStats")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          {t("dashboard.welcome")}{" "}
          {usuario && typeof usuario === "object"
            ? usuario.nombre?.toUpperCase()
            : ""}
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Productos Disponibles */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg p-8 transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              {t("dashboard.availableProducts")}
            </h2>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-5xl font-bold text-gray-900">
            {stats.productosDisponibles}
          </p>
        </div>

        {/* Total de Productos */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg p-8 transition-transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">
              {t("dashboard.totalProducts")}
            </h2>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-5xl font-bold text-gray-900">
            {stats.totalProductos}
          </p>
        </div>
      </div>
    </div>
  );
}
