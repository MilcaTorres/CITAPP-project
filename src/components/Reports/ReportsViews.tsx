import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Reporte } from '../../types';
import { ReportCard } from './ReportCard';
import { ReportDetail } from './ReportDetail';

export function ReportsView() {
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [filtered, setFiltered] = useState<Reporte[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState<Reporte | null>(null);

    useEffect(() => {
        loadReportes();
    }, []);

    useEffect(() => {
        const f = reportes.filter((r) => 
        r.empleado_codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(f);
    }, [searchTerm, reportes]);

    const loadReportes = async () => {
        const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('fecha', { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setReportes(data || []);
    };

    if (selected) {
        return (
            <ReportDetail reporte={selected} onBack={() => setSelected(null)} />
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">REPORTES</h1>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por código de empleado..."
                    className="w-full pl-10 pr-4 py-3 border rounded-lg"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((r) => (
                    <ReportCard key={r.id} reporte={r} onClick={() => setSelected(r)} />
                ))}
            </div>

            {filtered.length === 0 && (
                <p className="text-gray-500 text-center py-8">No se encontraron reportes.</p>
            )}
        </div>
    );
}