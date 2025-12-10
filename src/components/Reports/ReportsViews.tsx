import { FileText, Loader, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReporteSummary } from "../../models/report.model";
import { ReportService } from "../../services/report.service";
import { handleError } from "../../utils/error-handler";
import { ReportCard } from "./ReportCard";
import { ReportDetail } from "./ReportDetail";
import { useLanguage } from "../../contexts/LanguageContext";

export function ReportsView() {
  const { t } = useLanguage();
  const [reportes, setReportes] = useState<ReporteSummary[]>([]);
  const [filtered, setFiltered] = useState<ReporteSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<ReporteSummary | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportes();
  }, []);

  useEffect(() => {
    const f = reportes.filter(
      (r) =>
        r.empleado_codigo.includes(searchTerm) || r.fecha.includes(searchTerm)
    );
    setFiltered(f);
  }, [searchTerm, reportes]);

  const loadReportes = async () => {
    try {
      setLoading(true);
      const data = await ReportService.getAllReports();
      setReportes(data);
    } catch (err) {
      const appError = handleError(err);
      console.error("Error cargando reportes:", appError);
    } finally {
      setLoading(false);
    }
  };

  if (selectedReport) {
    return (
      <ReportDetail
        reporte={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {t("reports.title")}
          </h1>
          <p className="text-white mt-1">{t("reports.verificationHistory")}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("reports.searchPlaceholder")}
          className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            {t("reports.noReportsFound")}
          </h3>
          <p className="text-gray-500">{t("reports.tryAdjustSearch")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <ReportCard
              key={r.id}
              reporte={r}
              onClick={() => setSelectedReport(r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
