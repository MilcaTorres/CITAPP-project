import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ClipboardList,
  User,
} from "lucide-react";
import type { ReporteSummary } from "../../models/report.model";
import { useLanguage } from "../../contexts/LanguageContext";

interface ReportCardProps {
  reporte: ReporteSummary;
  onClick: () => void;
}

export function ReportCard({ reporte, onClick }: ReportCardProps) {
  const { t } = useLanguage();
  const hasIncidents = reporte.total_discrepancias > 0;

  // Formatear fecha y hora para mostrar en la línea de información
  const formatDateTime = (fecha: string) => {
    const date = new Date(fecha);
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedDate = date.toLocaleDateString("es-ES", dateOptions);
    const formattedTime = date.toLocaleTimeString("es-ES", timeOptions);
    return `${formattedDate} • ${formattedTime}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all border border-gray-100 hover:border-blue-200 group" // Ajuste: Reducir padding en móvil
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-0">
        {" "}
        {/* Ajuste: Poner en columna en móvil */}
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 sm:p-3 rounded-lg ${
              hasIncidents ? "bg-orange-100" : "bg-blue-100"
            }`}
          >
            {" "}
            {/* Ajuste: Reducir padding del ícono */}
            <ClipboardList
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                hasIncidents ? "text-orange-600" : "text-blue-600"
              }`}
            />{" "}
            {/* Ajuste: Reducir tamaño de ícono en móvil */}
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {" "}
              {/* Ajuste: Reducir tamaño de texto en móvil */}
              {t("reports.report")}
            </h3>
          </div>
        </div>
        {/* Badge de Incidencias/Correcto - Optimizado para Mobile */}
        {hasIncidents ? (
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full flex items-center font-medium self-start sm:self-center whitespace-nowrap">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {reporte.total_discrepancias} {t("reports.incidents")}
          </span>
        ) : (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full flex items-center font-medium self-start sm:self-center whitespace-nowrap">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("reports.correct")}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDateTime(reporte.fecha)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 overflow-hidden">
          <User className="w-4 h-4 mr-2 text-gray-400" />
          <span className="truncate">
            {t("reports.employee")}:{" "}
            <span className="font-mono font-medium text-gray-900">
              {reporte.empleado_codigo}
            </span>
          </span>{" "}
          {/* Ajuste: Truncar para evitar desbordes */}
        </div>
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {t("reports.productsVerified")}
          </span>
          <span className="font-bold text-gray-900">
            {reporte.total_productos}
          </span>
        </div>
      </div>
    </div>
  );
}
