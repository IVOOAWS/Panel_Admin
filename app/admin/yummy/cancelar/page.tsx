'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import {AlertDialog,AlertDialogAction,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "@/components/ui/alert-dialog";

export default function CancelarViajePage() {
  const [data, setData] = useState({ tripId: '', reason: '' });
  const [trips, setTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Estado para el modal
  const [modalConfig, setModalConfig] = useState({ 
    show: false, 
    title: "", 
    description: "", 
    isError: false 
  });

  // 1. Cargar los viajes al entrar a la página
  const fetchActiveTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await fetch('/api/yummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getTrips', data: {} })
      });
      const result = await res.json();
      
      if (result.status === 200 && result.response?.trips) {
        // CORRECCIÓN: Acceder a tripStatus.statusText en lugar de status_name
        const active = result.response.trips.filter((t: any) => {
          const status = t.tripStatus?.statusText?.toLowerCase() || "";
          
          // Agregamos 'aceptado' y 'tomado' a la lista de permitidos
          const estadosValidos = ['asignado', 'aceptado', 'tomado'];
          
          // Retorna true si el status coincide con alguno de los estados válidos
          return estadosValidos.some(el => status.includes(el));
        });
        setTrips(active);
      }
    } catch (error) {
      toast.error("Error al cargar la lista de viajes");
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchActiveTrips();
  }, []);


  const handleCancel = async () => {
    if (!data.tripId) return toast.error("Por favor, seleccione un viaje");
    if (data.reason.length < 5) return toast.error("Indique un motivo de cancelación");

    setIsCancelling(true);
    try {
      const res = await fetch('/api/yummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'cancelTrip', 
          data: { tripId: data.tripId, cancelReason: data.reason } 
        })
      });
      
      const result = await res.json();

      // 3. Lógica del modal para cancelación
      if (result.success || result.status === 200 || result.response?.success) {
        setModalConfig({
          show: true,
          title: "Viaje Cancelado",
          description: "¡Viaje cancelado con éxito!.",
          isError: false
        });
        setData({ tripId: '', reason: '' });
        fetchActiveTrips();
      } else {
        setModalConfig({
          show: true,
          title: "Error al Cancelar",
          description: result.message || "No se pudo anular el viaje en este momento.",
          isError: true
        });
      }
    } catch (error) {
      setModalConfig({
        show: true,
        title: "Error Crítico",
        description: "No hay respuesta del servidor de Yummy.",
        isError: true
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-12">
      <Card className="rounded-[50px] p-16 shadow-2xl border-none bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-red-600"><XCircle size={200} /></div>
        
        <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Cancelar Despacho</h2>
        <p className="text-gray-400 font-medium mb-12">Seleccione un viaje activo para anular la solicitud.</p>

        <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[30px] flex items-start gap-5 mb-12">
          <AlertCircle className="text-red-500 shrink-0" size={28} />
          <p className="text-xs text-red-800 font-black leading-relaxed uppercase tracking-wide">
            Aviso: Las cancelaciones son definitivas. Una vez cancelado, el motorizado no recibirá la orden.
          </p>
        </div>

        <div className="space-y-8">
          {/* SELECT DE VIAJES */}
          <div className="space-y-3">
            <div className="flex justify-between items-center ml-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Viajes Activos</Label>
              <Button variant="ghost" size="sm" onClick={fetchActiveTrips} className="h-6 text-[9px] font-bold">
                <RefreshCcw size={12} className={`mr-1 ${loadingTrips ? 'animate-spin' : ''}`} /> ACTUALIZAR
              </Button>
            </div>
            
            <Select onValueChange={(val) => setData({...data, tripId: val})} value={data.tripId}>
              <SelectTrigger className="h-16 rounded-2xl bg-gray-50 border-none px-8 font-black text-lg">
                <SelectValue placeholder={loadingTrips ? "Cargando viajes..." : "Seleccione un viaje..."} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl bg-white p-2">
                {trips.length > 0 ? trips.map((trip) => (
                  <SelectItem 
                    key={trip._id} 
                    value={trip._id}
                    className="rounded-xl mb-1 focus:bg-gray-100 focus:text-gray-900 cursor-pointer py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-black text-green-600">#{trip.unique_id}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase truncate max-w-[300px]">
                        {trip.destination_address}
                      </span>
                    </div>
                  </SelectItem>
                )) : (
                  <div className="p-8 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                    No hay viajes activos
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Motivo de Cancelación</Label>
            <Input 
              value={data.reason} 
              onChange={e => setData({...data, reason: e.target.value})} 
              placeholder="Ej: El cliente canceló la compra..." 
              className="h-16 rounded-2xl bg-gray-50 border-none px-8 font-bold" 
            />
          </div>

          <Button 
            onClick={handleCancel} 
            disabled={isCancelling || !data.tripId}
            className="w-full h-20 rounded-[28px] bg-red-600 hover:bg-red-700 text-white text-xl font-black shadow-2xl transition-all shadow-red-200"
          >
            {isCancelling ? "PROCESANDO..." : "ANULAR SOLICITUD DE VIAJE"}
          </Button>
        </div>
      </Card>
      <AlertDialog open={modalConfig.show} onOpenChange={(s) => setModalConfig({...modalConfig, show: s})}>
        <AlertDialogContent className="rounded-[40px] p-12 border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-3xl font-black uppercase ${modalConfig.isError ? 'text-red-600' : 'text-gray-900'}`}>
              {modalConfig.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-bold py-4">
              {modalConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-black text-white h-14 rounded-2xl px-12 font-black">
              CERRAR
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}