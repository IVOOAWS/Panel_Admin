'use client';

import { Card } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { LogOut, MapPin, Sun, Moon } from 'lucide-react';
import { KPICards } from '@/components/dashboard/kpi-cards';
import { OrderStats } from '@/components/dashboard/order-stats';
import { DeliveryProviderRanking } from '@/components/dashboard/delivery-provider-ranking';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllStores } from '@/lib/stores-db';
import { useTheme } from '@/context/theme-context';
import dynamic from 'next/dynamic';

// IMPORTACIONES DINÁMICAS: Esto evita el error "window is not defined" en Vercel
const SalesHeatmap = dynamic(
  () => import('@/components/dashboard/sales-heatmap').then((mod) => mod.SalesHeatmap),
  { 
    ssr: false, 
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Cargando mapa de calor...</div>
  }
);

interface Session {
  userId: string;
  userName: string;
  userRole: string;
}

function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setSession(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('[v0] Session fetch error:', error);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  // Datos de ejemplo para el heatmap
  const heatmapData = [
    { lat: 10.480, lng: -66.903, value: 85 },
    { lat: 10.485, lng: -66.900, value: 70 },
    { lat: 10.475, lng: -66.910, value: 90 },
    { lat: 10.490, lng: -66.895, value: 65 },
    { lat: 10.470, lng: -66.905, value: 80 },
  ];

  const providerData = [
    { name: 'Flety', deliveries: 342, rating: 4.8, completionRate: 98 },
    { name: 'Yummy', deliveries: 289, rating: 4.6, completionRate: 96 },
    { name: 'MRW', deliveries: 156, rating: 4.4, completionRate: 92 },
  ];

  const kpiData = {
    todayOrders: 127,
    avgDeliveryTime: 28,
    completionRate: 330,
    activeDeliveries: 34,
  };

  const orderStats = {
    delivery: 85,
    deliveryExpress: 32,
    pickup: 10,
  };

  const storeStats = [
    { id: 1, name: 'Valencia (Naguanagua)', orders: 24, revenue: 5600, expenses: 1200, region: 'Carabobo' },
    { id: 2, name: 'Caracas (La Candelaria)', orders: 18, revenue: 4200, expenses: 950, region: 'Distrito Capital' },
    { id: 4, name: 'Caracas (Plaza Venezuela)', orders: 15, revenue: 3800, expenses: 850, region: 'Distrito Capital' },
    { id: 9, name: 'Maracay (Los Aviadores)', orders: 12, revenue: 2800, expenses: 650, region: 'Aragua' },
    { id: 11, name: 'Barquisimeto (Av. Lara)', orders: 10, revenue: 2300, expenses: 520, region: 'Lara' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 lg:p-8 w-full pt-16 md:pt-0 min-h-screen transition-colors ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className={`text-2xl md:text-3xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Panel de Control</h1>
          <p className={`text-sm md:text-base mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Bienvenido, {session?.userName} • {session?.userRole}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-gray-200 hover:bg-gray-300 text-slate-600'}`}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Button onClick={handleLogout} variant="outline" className={`gap-2 flex-1 md:flex-none ${isDark ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : ''}`}>
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <KPICards data={kpiData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            {/* El componente dinámico se renderiza aquí */}
            <SalesHeatmap data={heatmapData} />
          </div>
          <div>
            <DeliveryProviderRanking data={providerData} />
          </div>
        </div>

        <OrderStats stats={orderStats} />

        <div>
          <h2 className={`text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            Estadísticas por Tienda
          </h2>
          <Card className={`p-4 md:p-6 overflow-x-auto ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead>
                  <tr className={`border-b-2 ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
                    <th className={`text-left py-2 md:py-3 px-2 md:px-4 font-bold text-xs md:text-sm uppercase ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Tienda</th>
                    <th className={`hidden sm:table-cell text-left py-2 md:py-3 px-2 md:px-4 font-bold text-xs md:text-sm uppercase ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Estado</th>
                    <th className={`text-center py-2 md:py-3 px-2 md:px-4 font-bold text-xs md:text-sm uppercase ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Órdenes</th>
                    <th className={`text-right py-2 md:py-3 px-2 md:px-4 font-bold text-xs md:text-sm uppercase ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Ingresos</th>
                    <th className={`hidden md:table-cell text-right py-2 md:py-3 px-2 md:px-4 font-bold text-xs md:text-sm uppercase ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Gastos</th>
                    <th className={`text-right py-2 md:py-3 px-2 md:px-4 font-bold text-xs md:text-sm uppercase ${isDark ? 'text-slate-300' : 'text-gray-900'}`}>Ganancia</th>
                  </tr>
                </thead>
                <tbody>
                  {storeStats.map((store) => {
                    const profit = store.revenue - store.expenses;
                    const margin = ((profit / store.revenue) * 100).toFixed(1);
                    return (
                      <tr key={store.id} className={`border-b ${isDark ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <td className={`py-3 md:py-4 px-2 md:px-4 font-semibold text-xs md:text-base ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>{store.name}</td>
                        <td className={`hidden sm:table-cell py-3 md:py-4 px-2 md:px-4 text-xs md:text-base ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{store.region}</td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {store.orders}
                          </span>
                        </td>
                        <td className={`py-3 md:py-4 px-2 md:px-4 text-right font-semibold text-xs md:text-base ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          ${store.revenue.toLocaleString()}
                        </td>
                        <td className={`hidden md:table-cell py-3 md:py-4 px-2 md:px-4 text-right text-xs md:text-base ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          ${store.expenses.toLocaleString()}
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4 text-right">
                          <div className={`font-semibold text-xs md:text-base ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                            ${profit.toLocaleString()}
                            <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>({margin}%)</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
