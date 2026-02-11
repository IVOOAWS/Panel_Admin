'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface OrderStats {
  delivery: number;
  deliveryExpress: number;
  pickup: number;
}

interface OrderStatsProps {
  stats: OrderStats;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

export function OrderStats({ stats }: OrderStatsProps) {
  const data = [
    { name: 'Delivery Regular', value: stats.delivery, color: '#3b82f6' },
    { name: 'Delivery Express', value: stats.deliveryExpress, color: '#f59e0b' },
    { name: 'Pickup', value: stats.pickup, color: '#10b981' },
  ];

  const total = stats.delivery + stats.deliveryExpress + stats.pickup;

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Package className="w-5 h-5 text-blue-600" />
        <h3 className="text-base md:text-lg font-semibold text-slate-900">Estadísticas de Pedidos</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="flex flex-col justify-center gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs md:text-sm text-slate-600 font-medium">Delivery</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats.delivery}</p>
              <p className="text-xs md:text-sm text-slate-600">
                {total > 0 && `${((stats.delivery / total) * 100).toFixed(1)}%`}
              </p>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs md:text-sm text-slate-600 font-medium">Delivery Express</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl md:text-3xl font-bold text-amber-600">{stats.deliveryExpress}</p>
              <p className="text-xs md:text-sm text-slate-600">
                {total > 0 && `${((stats.deliveryExpress / total) * 100).toFixed(1)}%`}
              </p>
            </div>
          </div>

          <div className="p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs md:text-sm text-slate-600 font-medium">Pickup</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.pickup}</p>
              <p className="text-xs md:text-sm text-slate-600">
                {total > 0 && `${((stats.pickup / total) * 100).toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200 text-center">
        <p className="text-xs md:text-sm text-slate-600 mb-1">Total de Pedidos</p>
        <p className="text-3xl md:text-4xl font-bold text-slate-900">{total}</p>
      </div>
    </Card>
  );
}
