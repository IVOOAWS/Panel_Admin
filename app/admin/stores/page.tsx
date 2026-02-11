'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Store } from '@/lib/stores-db';
import dynamic from 'next/dynamic';

// SOLUCIÓN: Importación dinámica del mapa para evitar el error "window is not defined"
const StoresMap = dynamic(
  () => import('@/components/admin/stores-map').then((mod) => mod.StoresMap),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Cargando mapa interactivo...</p>
        </div>
      </div>
    )
  }
);

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setStores(data.data);
      }
    } catch (error) {
      console.error('[v0] Error fetching stores:', error);
      toast.error('Error al cargar las tiendas');
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestión de Tiendas IVOO</h1>
            <p className="text-gray-600">
              Mapa interactivo de todas las sucursales y visualización de ubicaciones
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Store List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col bg-white border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tiendas ({filteredStores.length})</h2>
              <input
                type="text"
                placeholder="Buscar tienda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[600px]">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  Cargando...
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No se encontraron tiendas
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredStores.map((store) => (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                        selectedStore?.id === store.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                      }`}
                    >
                      <div className="font-semibold text-sm text-gray-900">{store.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{store.city}</div>
                      <div className="text-xs text-gray-500">{store.region}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Side - Map and Details */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
            {/* Si ya no está cargando los datos, mostramos el mapa dinámico */}
            {!loading && <StoresMap stores={filteredStores} onStoreClick={setSelectedStore} />}
            {loading && (
               <div className="w-full h-96 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
               </div>
            )}
          </Card>

          {selectedStore && (
            <Card className="bg-white border border-gray-200 shadow-sm p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedStore.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Building2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Dirección</p>
                      <p className="font-medium text-gray-900">{selectedStore.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-medium text-gray-900">
                        {selectedStore.latitude.toFixed(4)}, {selectedStore.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Ciudad</p>
                    <p className="font-medium text-gray-900">{selectedStore.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Región</p>
                    <p className="font-medium text-gray-900">{selectedStore.region}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}