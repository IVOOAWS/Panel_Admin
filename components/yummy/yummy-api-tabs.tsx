'use client';

import { useState, useRef, useCallback } from 'react';
import { GoogleMap, Autocomplete, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronRight, Navigation2, Info, CheckCircle2, User, ShoppingBag, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import {AlertDialog,AlertDialogAction,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "@/components/ui/alert-dialog";

const LIBRARIES: ("places")[] = ["places"];

// --- DATA REAL INTEGRADA ---
const IVOO_STORES = [
    { id: 1, name: "IVOO Valencia (Naguanagua)", address: "URB VALLE ALTO", lat: 10.2610627, lng: -68.0050111 },
    { id: 2, name: "IVOO Valencia (Av. Bolívar)", address: "Av. Bolívar Norte", lat: 10.2193204, lng: -68.0121884 },
    { id: 3, name: "IVOO Valencia (Av. Lara)", address: "Av. Lara con Feria", lat: 10.1785222, lng: -68.0051431 },
    { id: 4, name: "IVOO Caracas (Sambil La Candelaria)", address: "C.C. Sambil La Candelaria", lat: 10.505001, lng: -66.9036363 },
    { id: 5, name: "IVOO Caracas (Plaza Venezuela)", address: "Torre La Previsora", lat: 10.4975891, lng: -66.8835086 },
    { id: 6, name: "IVOO Caracas (C.C. Líder)", address: "C.C. Líder, Boleíta Sur", lat: 10.4861521, lng: -66.8232729 },
    { id: 7, name: "IVOO Caracas (Boleíta)", address: "Final Calle Imboca", lat: 10.4861783, lng: -66.8309977 },
    { id: 8, name: "IVOO Caracas (Av. Libertador)", address: "Av. Las Acacias", lat: 10.4975891, lng: -66.8835086 },
    { id: 9, name: "IVOO Maracay (C.C. Los Aviadores)", address: "Av. Los Aviadores", lat: 10.1885998, lng: -67.5823104 },
    { id: 10, name: "IVOO Maracay (Av. Las Delicias)", address: "C.C. Las Camelias", lat: 10.2688765, lng: -67.5895612 },
    { id: 11, name: "IVOO Barquisimeto (Av. Lara)", address: "Torre Esser", lat: 10.0646381, lng: -69.2958692 },
    { id: 12, name: "IVOO Barquisimeto (Sambil)", address: "C.C. Sambil PB", lat: 10.0646643, lng: -69.303594 },
    { id: 13, name: "IVOO Maracaibo (Av. Las Delicias)", address: "Sector San José", lat: 10.6667261, lng: -71.6223708 },
    { id: 14, name: "IVOO San Francisco", address: "C.C. Paseo San Francisco", lat: 10.5555585, lng: -71.621211 },
    { id: 15, name: "IVOO Mérida (C.C. Rodeo Plaza)", address: "Av. Las Américas", lat: 8.5896344, lng: -71.1641318 },
    { id: 16, name: "IVOO El Vigía (C.C. Junior Mall)", address: "Av. Don Pepe Rojas", lat: 8.6110882, lng: -71.6636064 },
    { id: 17, name: "IVOO San Cristóbal (Av. Carabobo)", address: "Av. Carabobo", lat: 7.7753666, lng: -72.2312537 },
    { id: 18, name: "IVOO Lechería (Av. Américo Vespucio)", address: "Lechería", lat: 10.2004192, lng: -64.6839732 },
    { id: 19, name: "IVOO Puerto La Cruz", address: "Calle Bolívar", lat: 10.2199796, lng: -64.6409276 },
    { id: 20, name: "IVOO El Tigre", address: "C.C. Petrucci", lat: 8.8936662, lng: -64.2425835 },
    { id: 22, name: "IVOO Puerto Ordaz", address: "Villa Granada", lat: 8.3149605, lng: -62.7265338 },
    { id: 23, name: "IVOO Maturín", address: "Centro Maturín", lat: 9.7406654, lng: -63.1689814 },
    { id: 24, name: "IVOO Cumaná", address: "Calle Mariño", lat: 10.4637008, lng: -64.1854782 },
    { id: 25, name: "IVOO Acarigua", address: "C.C. Llano Mall", lat: 9.5717288, lng: -69.201191 },
    { id: 26, name: "IVOO Barinas", address: "Centro Financiero Atef", lat: 8.6157496, lng: -70.2551453 },
    { id: 27, name: "IVOO Valera", address: "C.C. Ideal", lat: 9.3129735, lng: -70.6122075 },
    { id: 28, name: "IVOO Puerto Cabello", address: "Av. La Paz", lat: 10.472484, lng: -68.0390999 }
];

export function YummyApiTabs() {
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(IVOO_STORES[0]);
  const [destination, setDestination] = useState<any>(null);
  const [quotation, setQuotation] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [receiver, setReceiver] = useState({ firstName: 'Riccardo', lastName: 'Fusco', phone: '04122928717' });
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Estado para el modal
  const [modalConfig, setModalConfig] = useState({ 
    show: false, 
    title: "", 
    description: "", 
    isError: false 
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAEauWY8tB9iKYjYEy3B48JgsEAMlXU91s",
    libraries: LIBRARIES
  });

  // CORRECCIÓN DEL ERROR DE COMPILACIÓN: useCallback inicializado correctamente
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const fetchQuotation = async (dLat: number, dLng: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/yummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createQuotation',
          data: { pickupLatitude: selectedStore.lat, pickupLongitude: selectedStore.lng, destinationLatitude: dLat, destinationLongitude: dLng }
        })
      });
      const result = await res.json();
      if (result.status === 201) setQuotation(result.response);
    } catch (e) { toast.error("Error al obtener tarifas."); }
    finally { setLoading(false); }
  };

  const calculateRoute = (dLat: number, dLng: number) => {
    const service = new google.maps.DirectionsService();
    service.route({
      origin: { lat: selectedStore.lat, lng: selectedStore.lng },
      destination: { lat: dLat, lng: dLng },
      travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
      if (status === 'OK' && result) {
        setDirections(result);
        if (map && result.routes[0].bounds) {
          map.fitBounds(result.routes[0].bounds); // CENTRA LA RUTA AUTOMÁTICAMENTE
        }
      }
    });
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const loc = { 
          address: place.formatted_address, 
          lat: place.geometry.location.lat(), 
          lng: place.geometry.location.lng() 
        };
        setDestination(loc);
        calculateRoute(loc.lat, loc.lng);
        
        // Llamada crucial:
        fetchQuotation(loc.lat, loc.lng); 
      }
    }
  };

  const handleConfirmTrip = async () => {
    if (!quotation || !selectedService) {
      toast.error("Faltan datos de cotización o servicio");
      return;
    }
    
    setLoading(true);
    
    const payload = {
      paymentMode: 7,
      quotationId: quotation.quotationId,
      serviceTypeId: selectedService.service_type_id,
      sourceAddress: selectedStore.address,
      destinationAddress: destination.address,
      receiver_first_name: receiver.firstName,
      receiver_last_name: receiver.lastName,
      receiver_phone_number: receiver.phone,
      receiver_country_phone_code: "+58",
      storeDetail: {
        storeAliasName: "IVOO",
        storeFullName: selectedStore.name,
        storePhone: "4242662325",
        storeCountryPhoneCode: "+58"
      },
      tripProducts: [{ name: "Envío de Mercancía IVOO", quantity: 1, price: selectedService.estimated_fare }]
    };

    try {
      const response = await fetch('/api/yummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createTrip', data: payload })
      });
      
      const result = await response.json();

      if (result.status === 200 || result.status === 201 || result.success === true || result.response?.success === true) {
        // Configuración de éxito para el Modal
        setModalConfig({
          show: true,
          title: "¡Viaje Creado Exitosamente!",
          description: `¡Viaje creado con éxito!. ID de seguimiento: ${result.response?.trip_id || result.trip_id}`,
          isError: false
        });
        
        setStep(1); 
        setDestination(null);
        setQuotation(null);
      } else {
        // Configuración de error de la API
        setModalConfig({
          show: true,
          title: "Error al crear el viaje",
          description: result.message || result.response?.message || "La solicitud no pudo ser procesada por Yummy.",
          isError: true
        });
      }
    } catch (error) {
      // Configuración de error crítico
      setModalConfig({
        show: true,
        title: "Error de Conexión",
        description: "No se pudo establecer comunicación con el servidor de Yummy.",
        isError: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <div className="h-screen flex items-center justify-center font-bold text-green-600 animate-pulse">Cargando Plataforma IVOO...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-12">
      {/* Stepper Header */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all shadow-xl ${step === 1 ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>
            <MapPin size={28} />
          </div>
          <span className="text-[10px] font-black uppercase mt-3 text-green-900">1. Logística</span>
        </div>
        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: step === 2 ? "100%" : "0%" }} className="h-full bg-green-500" />
        </div>
        <div className={`flex flex-col items-center transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
          <div className={`w-14 h-14 rounded-3xl flex items-center justify-center border-2 transition-all ${step === 2 ? 'bg-green-600 text-white border-green-600 shadow-xl' : 'bg-white text-gray-300 border-dashed'}`}>
            <User size={28} />
          </div>
          <span className={`text-[10px] font-black uppercase mt-3 ${step === 2 ? 'text-green-900' : 'text-gray-400'}`}>2. Receptor</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-10">
              <div className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl border border-white/50">
                <h2 className="text-3xl font-black text-gray-900 mb-10">Ruta de Entrega</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">Punto de Partida</Label>
                    <Select onValueChange={(v) => setSelectedStore(IVOO_STORES.find(s => s.id === Number(v))!)}>
                      <SelectTrigger className="h-16 rounded-2xl border-none bg-gray-100/50 hover:bg-gray-100 px-6">
                        <SelectValue placeholder="Seleccione sucursal" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl max-h-80">
                        {IVOO_STORES.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-gray-400 uppercase tracking-tighter">Destino</Label>
                    <Autocomplete 
                      onLoad={(auto) => (autocompleteRef.current = auto)} 
                      onPlaceChanged={onPlaceChanged}
                      options={{ componentRestrictions: { country: "ve" }, location: new google.maps.LatLng(selectedStore.lat, selectedStore.lng), radius: 50000 }}
                    >
                      <Input placeholder="Buscar dirección exacta..." className="h-16 rounded-2xl border-none bg-gray-100/50 px-6" />
                    </Autocomplete>
                  </div>
                </div>

                {quotation && (
                  <div className="mt-12 grid grid-cols-2 gap-6">
                    {quotation.trip_services.map((service: any) => {
                      const name = service.typename.toLowerCase();
                      // Lógica mejorada para distinguir vehículos
                      const isMoto = name.includes('backpack') || (!name.includes('xl') && !name.includes('express'));
                      
                      const isSelected = selectedService?.service_type_id === service.service_type_id;
                      const vehicleImg = isMoto ? "/yummy-moto.png" : "/yummy-car.png";

                      // NUEVA LÓGICA DE NOMBRE:
                      // Si el nombre original contiene 'express', lo mostramos como 'Mandaditos XL'
                      const displayName = name.includes('express') ? 'Mandaditos XL' : service.name;

                      return (
                        <motion.div 
                          key={service.service_type_id} 
                          onClick={() => setSelectedService(service)}
                          className={`relative p-6 rounded-[32px] border-4 transition-all cursor-pointer ${
                            isSelected ? 'border-green-600 bg-green-50/50' : 'border-transparent bg-gray-50'
                          }`}
                        >
                          <img src={vehicleImg} className="w-24 h-20 object-contain mb-4 mx-auto" alt={displayName} />
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase">{isMoto ? 'MOTO' : 'CARRO'}</p>
                              {/* Usamos displayName en lugar de service.name */}
                              <p className="text-sm font-bold text-gray-900 leading-none">{displayName}</p>
                            </div>
                            <p className="text-2xl font-black text-green-700 leading-none">${service.estimated_fare}</p>
                          </div>
                          {isSelected && <div className="absolute top-4 right-4 text-green-600"><CheckCircle2 size={20} fill="white"/></div>}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
                <Button disabled={!selectedService} className="w-full h-16 rounded-[28px] bg-green-600 mt-12 text-xl font-black shadow-2xl transition-all" onClick={() => setStep(2)}>
                  SIGUIENTE PASO <ChevronRight className="ml-2 w-6 h-6" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="rounded-[50px] overflow-hidden h-[750px] border-none shadow-2xl sticky top-10">
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: selectedStore.lat, lng: selectedStore.lng }} zoom={15} onLoad={onMapLoad} options={{ disableDefaultUI: true }}>
                  <Marker position={{ lat: selectedStore.lat, lng: selectedStore.lng }} icon={{ url: "/images/image_12449f.png", scaledSize: new google.maps.Size(45, 45), anchor: new google.maps.Point(22, 45) }} zIndex={999} />
                  {destination && <Marker position={{ lat: destination.lat, lng: destination.lng }} zIndex={998} />}
                  {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#16a34a', strokeWeight: 8 } }} />}
                </GoogleMap>
                {quotation && (
                  <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute bottom-12 left-10 right-10 bg-white/80 backdrop-blur-md p-8 rounded-[35px] shadow-2xl border border-white flex gap-6 items-center">
                    <div className="w-16 h-16 rounded-3xl bg-green-600 flex items-center justify-center text-white"><Navigation2 size={32} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cálculo de Ruta</p>
                      <p className="text-2xl font-black text-gray-900">{quotation.distance} KM | {Math.round(quotation.eta / 60)} MIN</p>
                    </div>
                  </motion.div>
                )}
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="max-w-3xl mx-auto">
            <Card className="rounded-[40px] p-10 shadow-2xl border-none bg-white">
                <h2 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-3"><User className="text-green-600 w-8 h-8" /> Datos del Receptor</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2"><Label className="text-[11px] font-black text-gray-400 uppercase ml-1">Nombre</Label>
                    <Input value={receiver.firstName} onChange={e => setReceiver({...receiver, firstName: e.target.value})} className="h-16 rounded-2xl border-none bg-gray-100/50 px-6 font-semibold" /></div>
                    <div className="space-y-2"><Label className="text-[11px] font-black text-gray-400 uppercase ml-1">Apellido</Label>
                    <Input value={receiver.lastName} onChange={e => setReceiver({...receiver, lastName: e.target.value})} className="h-16 rounded-2xl border-none bg-gray-100/50 px-6 font-semibold" /></div>
                    <div className="col-span-1 md:col-span-2 space-y-2"><Label className="text-[11px] font-black text-gray-400 uppercase ml-1">Teléfono</Label>
                    <Input value={receiver.phone} onChange={e => setReceiver({...receiver, phone: e.target.value})} className="h-16 rounded-2xl border-none bg-gray-100/50 px-6 font-semibold" /></div>
                </div>
                <div className="bg-green-50/50 rounded-[30px] p-8 border border-green-100 mb-10 space-y-3">
                    <h4 className="text-sm font-black text-green-900 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag size={18} /> Resumen de Orden</h4>
                    <div className="flex justify-between border-b border-green-100 pb-2"><span>Origen:</span><span className="font-bold">{selectedStore.name}</span></div>
                    <div className="flex justify-between border-b border-green-100 pb-2"><span>Destino:</span><span className="font-bold text-right max-w-[300px]">{destination?.address}</span></div>
                    <div className="flex justify-between border-b border-green-100 pb-2"><span>Servicio:</span><span className="font-bold">{selectedService?.name}</span></div>
                    <div className="flex justify-between pt-2 text-xl font-black text-green-900 uppercase"><span>Total Envio:</span><span>${selectedService?.estimated_fare} USD</span></div>
                </div>
                <div className="flex gap-6">
                    <Button variant="outline" className="flex-1 h-16 rounded-[28px] border-2 border-gray-100 font-bold" onClick={() => setStep(1)}><ChevronLeft className="mr-2" /> VOLVER</Button>
                    <Button className="flex-[2] h-16 rounded-[28px] bg-green-600 hover:bg-green-700 text-xl font-black shadow-2xl" onClick={handleConfirmTrip} disabled={loading}>{loading ? "PROCESANDO..." : "CONFIRMAR Y SOLICITAR"}</Button>
                </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <AlertDialog open={modalConfig.show} onOpenChange={(s) => setModalConfig({...modalConfig, show: s})}>
      <AlertDialogContent className="rounded-[40px] p-12 border-none shadow-2xl bg-white">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${modalConfig.isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {modalConfig.isError ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
          </div>
          <AlertDialogTitle className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
            {modalConfig.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500 font-bold text-lg mt-4">
            {modalConfig.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-10 sm:justify-center">
          <AlertDialogAction 
            className={`h-16 rounded-2xl px-12 font-black text-white transition-all ${modalConfig.isError ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            ENTENDIDO
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}