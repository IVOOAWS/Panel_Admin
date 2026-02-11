'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface KPIData {
  todayOrders: number;
  avgDeliveryTime: number;
  completionRate: number;
  activeDeliveries: number;
}

interface KPICardsProps {
  data: KPIData;
}

export function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      title: 'Pedidos Hoy',
      value: data.todayOrders,
      icon: TrendingUp,
      color: 'blue',
      unit: 'pedidos',
    },
    {
      title: 'Tiempo Promedio',
      value: data.avgDeliveryTime,
      icon: Clock,
      color: 'amber',
      unit: 'min',
    },
    {
      title: 'Pedidos Mes',
      value: data.completionRate,
      icon: CheckCircle,
      color: 'green',
      unit: 'pedidos',
    },
    {
      title: 'Entregas Activas',
      value: data.activeDeliveries,
      icon: AlertCircle,
      color: 'red',
      unit: 'en ruta',
    },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const colorClass = colorMap[kpi.color as keyof typeof colorMap];

        return (
          <Card key={index} className={`p-3 md:p-6 border ${colorClass}`}>
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-600 mb-1">{kpi.title}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1 md:mt-2">{kpi.unit}</p>
              </div>
              <Icon className="w-6 md:w-8 h-6 md:h-8 opacity-20 flex-shrink-0" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
