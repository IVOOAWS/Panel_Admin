'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrdersTable, type Order } from '@/components/admin/orders-table';
import { Button } from '@/components/ui/button';
import { LogOut, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('[v0] Orders fetched:', data);
      
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('[v0] Error fetching orders:', error);
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success('Órdenes actualizadas');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Historial de Órdenes</h1>
            <p className="text-gray-600">
              Administración centralizada de entregas desde IVOOAPP
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="gap-2 text-black border-gray-300 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-semibold uppercase">Total Órdenes</div>
          <div className="text-3xl font-bold text-black mt-2">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-semibold uppercase">En Tránsito</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {orders.filter(o => o.deliveryStatus === 'in_progress' || o.deliveryStatus === 'in_route' || o.deliveryStatus === 'in_store').length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-semibold uppercase">Entregadas</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {orders.filter(o => o.deliveryStatus === 'delivered').length}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <OrdersTable
        orders={orders}
        title="Todas las Órdenes"
        loading={loading}
      />
    </div>
  );
}
