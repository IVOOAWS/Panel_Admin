'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, RefreshCcw, XCircle, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function YummyStatusPage() {
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [timeRange, setTimeRange] = useState('all'); // Nuevo estado para rango rápido
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchYummyTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/yummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'getTrips', 
          data: { page: 1, limit: 100 }
        })
      });

      const result = await response.json();
      if (result.status === 200 && result.response?.trips) {
        setTrips(result.response.trips);
      }
    } catch (error) {
      toast.error("Error al sincronizar con Yummy");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYummyTrips();
  }, [fetchYummyTrips]);

  // --- LÓGICA DE RANGO DE TIEMPO RÁPIDO ---
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setCurrentPage(1);

    if (value === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }

    const today = new Date();
    const start = new Date();
    
    // Normalizar a inicio y fin del día
    today.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    switch (value) {
      case 'today':
        // Tanto inicio como fin deben ser hoy
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(start.toISOString().split('T')[0]); // Cambiado de 'today' a 'start' para ser exactos
        break;
      case '7days':
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case '90days':
        start.setDate(today.getDate() - 90);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setServiceType('all');
    setFilterType('all');
    setTimeRange('all');
    setCurrentPage(1);
    toast.info("Filtros restablecidos");
  };

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      // 1. Filtros de Estado, Búsqueda y Servicio (Se mantienen igual)
      const statusText = trip.tripStatus?.statusText?.toLowerCase() || '';
      const matchesStatus = filterType === 'all' || 
        (filterType === 'ACCEPTED' && statusText.includes('aceptado')) ||
        (filterType === 'CANCELLED' && statusText.includes('cancelado')) ||
        (filterType === 'COMPLETED' && statusText.includes('completado')) ||
        (filterType === 'PENDING' && statusText.includes('espera'));

      const matchesSearch = !searchQuery || trip.unique_id?.toString().includes(searchQuery);
      const matchesService = serviceType === 'all' || trip.serviceType?.typename === serviceType;

      // 2. LÓGICA DE FECHA CORREGIDA: Comparación por String YYYY-MM-DD
      // Obtenemos la fecha del viaje en formato local YYYY-MM-DD
      const tripDate = new Date(trip.created_at);
      const tripDateString = tripDate.toLocaleDateString('en-CA'); // 'en-CA' genera formato YYYY-MM-DD siempre

      // Las variables startDate y endDate ya vienen en formato YYYY-MM-DD desde los inputs
      const matchesStartDate = !startDate || tripDateString >= startDate;
      const matchesEndDate = !endDate || tripDateString <= endDate;

      return matchesStatus && matchesSearch && matchesService && matchesStartDate && matchesEndDate;
    });
  }, [trips, filterType, searchQuery, serviceType, startDate, endDate]);


  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrips.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrips, currentPage]);

  const uniqueServices = useMemo(() => {
    const services = trips.map(t => t.serviceType?.typename).filter(Boolean);
    return Array.from(new Set(services));
  }, [trips]);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 bg-[#F8F9FC] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Trip Status</h1>
          <p className="text-gray-500 font-medium">Monitoreo de flota corporativa en tiempo real</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <Button variant="outline" onClick={fetchYummyTrips} className="flex-1 md:flex-none h-12 rounded-xl font-bold gap-2 border-2">
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} /> REFRESCAR
          </Button>
          <Button onClick={() => XLSX.writeFile(XLSX.utils.book_new(), "Reporte_Yummy.xlsx")} className="flex-1 md:flex-none h-12 bg-[#00B14F] hover:bg-[#009643] rounded-xl px-6 font-bold gap-2 shadow-lg text-white">
            <Download size={18} /> EXPORTAR
          </Button>
        </div>
      </div>

      {/* Barra de Filtros con Rango de Tiempo Rápido */}
      <div className="bg-white p-4 md:p-6 rounded-[30px] shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
        <div className="space-y-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase ml-2">ID / Factura</Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            <Input value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} className="h-14 pl-12 rounded-2xl bg-[#F8F9FC] border-none font-bold" placeholder="Buscar ID..." />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Servicio</Label>
          <Select value={serviceType} onValueChange={(v) => {setServiceType(v); setCurrentPage(1);}}>
            <SelectTrigger className="h-14 rounded-2xl bg-[#F8F9FC] border-none font-bold px-4">
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl font-bold">
              <SelectItem value="all">TODOS</SelectItem>
              {uniqueServices.map((service) => (
                <SelectItem key={service} value={service}>{service?.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Rango de Tiempo</Label>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="h-14 rounded-2xl bg-[#F8F9FC] border-none font-bold px-4">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl font-bold">
              <SelectItem value="all">TODOS</SelectItem>
              <SelectItem value="today">HOY</SelectItem>
              <SelectItem value="7days">ÚLTIMOS 7 DÍAS</SelectItem>
              <SelectItem value="30days">ÚLTIMOS 30 DÍAS</SelectItem>
              <SelectItem value="90days">ÚLTIMOS 90 DÍAS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Desde</Label>
          <Input type="date" value={startDate} onChange={(e) => {setStartDate(e.target.value); setTimeRange('custom'); setCurrentPage(1);}} className="h-14 rounded-2xl bg-[#F8F9FC] border-none font-bold px-4 text-xs" />
        </div>
        
        <div className="space-y-1">
          <Label className="text-[10px] font-black text-gray-400 uppercase ml-2">Hasta</Label>
          <Input type="date" value={endDate} onChange={(e) => {setEndDate(e.target.value); setTimeRange('custom'); setCurrentPage(1);}} className="h-14 rounded-2xl bg-[#F8F9FC] border-none font-bold px-4 text-xs" />
        </div>

        <div className="flex items-center justify-center">
          <Button variant="ghost" onClick={clearFilters} className="w-full h-14 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl font-black transition-all gap-2">
            <XCircle size={20} /> LIMPIAR
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center w-full overflow-x-auto pb-2">
        <Tabs value={filterType} onValueChange={(v) => {setFilterType(v); setCurrentPage(1);}} className="w-auto">
          <TabsList className="bg-white p-1.5 rounded-[22px] h-14 shadow-sm border border-gray-100 flex gap-1 min-w-max">
            <TabsTrigger value="all" className="rounded-[18px] font-black px-8 text-xs uppercase">Todos</TabsTrigger>
            <TabsTrigger value="ACCEPTED" className="rounded-[18px] font-black px-8 text-xs uppercase">Aceptado</TabsTrigger>
            <TabsTrigger value="CANCELLED" className="rounded-[18px] font-black px-8 text-xs uppercase">Cancelado</TabsTrigger>
            <TabsTrigger value="COMPLETED" className="rounded-[18px] font-black px-8 text-xs uppercase">Completado</TabsTrigger>
            <TabsTrigger value="PENDING" className="rounded-[18px] font-black px-8 text-xs uppercase">En Espera</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader className="bg-[#FBFBFE]">
              <TableRow className="border-none">
                <TableHead className="font-black text-[10px] uppercase text-gray-400 px-6">ID</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-gray-400">Conductor</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-gray-400">Servicio</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-gray-400">Salida</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-gray-400">Llegada</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-gray-400 text-center">Estado</TableHead>
                <TableHead className="font-black text-[10px] uppercase text-gray-400 text-right pr-6">Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTrips.map((trip: any) => (
                <TableRow key={trip._id} className="hover:bg-[#F8F9FC]/80 border-b border-gray-50 transition-colors">
                  <TableCell className="font-bold text-[#3B82F6] px-6 text-xs italic">#{trip.unique_id}</TableCell>
                  <TableCell className="text-xs font-bold text-[#1A1C21]">
                    {trip.provider ? `${trip.provider.first_name} ${trip.provider.last_name}` : 'Asignando...'}
                  </TableCell>
                  <TableCell className="text-[10px] font-black uppercase text-[#1A1C21]">{trip.serviceType?.typename}</TableCell>
                  <TableCell className="text-[10px] max-w-[150px] truncate text-gray-500" title={trip.source_address}>{trip.source_address}</TableCell>
                  <TableCell className="text-[10px] max-w-[150px] truncate text-gray-500" title={trip.destination_address}>{trip.destination_address}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="text-[9px] font-black rounded-full px-2.5 py-0.5 border"
                      style={{ backgroundColor: trip.tripStatus?.colorBg, color: trip.tripStatus?.colorText, borderColor: trip.tripStatus?.colorBorder }}>
                      {trip.tripStatus?.statusText}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-medium text-gray-500 text-right pr-6">
                    {new Date(trip.created_at).toLocaleString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {filteredTrips.length > 0 ? (
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Mostrando {paginatedTrips.length} de {filteredTrips.length} viajes
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border-2 h-10 w-10"
              >
                <ChevronLeft size={20} />
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-xs ${currentPage === i + 1 ? 'bg-black text-white' : 'text-gray-400'}`}
                  >
                    {i + 1}
                  </Button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border-2 h-10 w-10"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        ) : !isLoading && (
          <div className="py-24 text-center text-gray-400 font-black uppercase text-xs tracking-widest">
            No se encontraron viajes con estos filtros
          </div>
        )}
      </div>
    </div>
  );
}