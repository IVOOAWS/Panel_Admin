'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, RefreshCw, Filter, Loader } from 'lucide-react';

interface ReportData {
  summary: Array<{
    scan_type: string;
    count: number;
  }>;
  recent: Array<{
    id: number;
    barcode: string;
    qty_scanned: number;
    scan_type: string;
    scanned_by: string;
    sku: string;
    item_name: string;
    order_number: string;
    created_at: string;
  }>;
  date_range: {
    start: string;
    end: string;
  };
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function InventoryReportsPage() {
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [scanType, setScanType] = useState<string>('');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      if (scanType) params.append('scan_type', scanType);

      const response = await fetch(`/api/inventory/reports?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilter = () => {
    fetchReports();
  };

  const exportToCSV = () => {
    if (!data?.recent) return;

    const csv = [
      ['Fecha', 'Tipo de Escaneo', 'SKU', 'Nombre del Artículo', 'Cantidad', 'Escanado Por', 'Orden'],
      ...data.recent.map(item => [
        new Date(item.created_at).toLocaleDateString(),
        item.scan_type,
        item.sku,
        item.item_name,
        item.qty_scanned,
        item.scanned_by,
        item.order_number,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Inventario</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Monitorea escaneos y movimientos de inventario
          </p>
        </div>
        <Button onClick={exportToCSV} className="gap-2 bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Fin</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Escaneo</label>
              <Select value={scanType || 'all'} onValueChange={(value) => setScanType(value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PICK">Pick</SelectItem>
                  <SelectItem value="PACK">Pack</SelectItem>
                  <SelectItem value="LOAD">Load</SelectItem>
                  <SelectItem value="DELIVER">Deliver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleFilter} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      {data && !isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total de Escaneos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {data.summary.reduce((sum, item) => sum + item.count, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Tipos de Escaneo Únicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.summary.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-500">
                  Período Reportado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {new Date(data.date_range.start).toLocaleDateString()} a{' '}
                  {new Date(data.date_range.end).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle>Escaneos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.summary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scan_type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pie */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tipos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.summary}
                      dataKey="count"
                      nameKey="scan_type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.summary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Escaneos Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Escaneos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Fecha</th>
                      <th className="text-left py-2 px-4">Tipo</th>
                      <th className="text-left py-2 px-4">SKU</th>
                      <th className="text-left py-2 px-4">Artículo</th>
                      <th className="text-right py-2 px-4">Cantidad</th>
                      <th className="text-left py-2 px-4">Escanado Por</th>
                      <th className="text-left py-2 px-4">Orden</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="py-2 px-4">
                          {new Date(item.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-2 px-4">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                            {item.scan_type}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-mono">{item.sku}</td>
                        <td className="py-2 px-4">{item.item_name}</td>
                        <td className="py-2 px-4 text-right">{item.qty_scanned}</td>
                        <td className="py-2 px-4">{item.scanned_by}</td>
                        <td className="py-2 px-4 font-mono">{item.order_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      )}

      {!data && !isLoading && !loading && (
        <Card className="text-center py-12">
          <p className="text-gray-500">No hay datos disponibles para los filtros seleccionados</p>
        </Card>
      )}
    </div>
  );
}
