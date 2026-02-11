'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, TrendingUp, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderExpense {
  provider: 'Flety' | 'MRW' | 'Yummy';
  totalCost: number;
  totalOrders: number;
  averageCost: number;
  status: 'active' | 'inactive';
  color: string;
  icon: string;
}

export default function AccountingPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ProviderExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        calculateExpenses(data.data);
      }
    } catch (error) {
      console.error('[v0] Error fetching accounting data:', error);
      toast.error('Error al cargar datos de contabilidad');
    } finally {
      setLoading(false);
    }
  };

  const calculateExpenses = (orders: any[]) => {
    const providers: Record<string, any> = {
      'Flety': { totalCost: 0, totalOrders: 0, color: 'blue', icon: '🚚' },
      'MRW': { totalCost: 0, totalOrders: 0, color: 'red', icon: '📦' },
      'Yummy': { totalCost: 0, totalOrders: 0, color: 'orange', icon: '🚙' },
    };

    orders.forEach((order: any) => {
      if (providers[order.shippingCompany]) {
        providers[order.shippingCompany].totalCost += order.cost;
        providers[order.shippingCompany].totalOrders += 1;
      }
    });

    const expensesList: ProviderExpense[] = Object.entries(providers).map(
      ([provider, data]) => ({
        provider: provider as 'Flety' | 'MRW' | 'Yummy',
        totalCost: data.totalCost,
        totalOrders: data.totalOrders,
        averageCost: data.totalOrders > 0 ? data.totalCost / data.totalOrders : 0,
        status: 'active' as const,
        color: data.color,
        icon: data.icon,
      })
    );

    setExpenses(expensesList);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.totalCost, 0);
  const totalOrders = expenses.reduce((sum, exp) => sum + exp.totalOrders, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos de contabilidad...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Contabilidad de Gastos</h1>
            <p className="text-gray-600">
              Análisis de costos por proveedor de delivery
            </p>
          </div>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Gasto Total</p>
              <p className="text-4xl font-bold text-black mt-2">
                ${totalExpense.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                De {totalOrders} órdenes procesadas
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 font-semibold uppercase">Promedio por Orden</p>
              <p className="text-4xl font-bold text-black mt-2">
                ${(totalOrders > 0 ? totalExpense / totalOrders : 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Costo promedio del envío
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Provider Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {expenses.map((expense) => (
          <Card key={expense.provider} className="p-6 bg-white border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-black">{expense.provider}</p>
              </div>
              <div className="text-4xl">{expense.icon}</div>
            </div>

            <div className="space-y-4">
              {/* Total Cost */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Gasto Total
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${expense.totalCost.toFixed(2)}
                </p>
              </div>

              {/* Total Orders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                    Órdenes
                  </p>
                  <p className="text-2xl font-bold text-black">
                    {expense.totalOrders}
                  </p>
                </div>

                {/* Average Cost */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                    Promedio
                  </p>
                  <p className="text-2xl font-bold text-black">
                    ${expense.averageCost.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-600 font-semibold">
                    Porcentaje del Total
                  </p>
                  <p className="text-xs font-bold text-black">
                    {totalExpense > 0
                      ? ((expense.totalCost / totalExpense) * 100).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{
                      width: `${
                        totalExpense > 0
                          ? (expense.totalCost / totalExpense) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Nota:</span> Los datos de contabilidad se actualizan
          automáticamente según las órdenes registradas en el sistema. Los costos provienen de
          la información de cada envío procesado por los proveedores de delivery.
        </p>
      </div>
    </div>
  );
}
