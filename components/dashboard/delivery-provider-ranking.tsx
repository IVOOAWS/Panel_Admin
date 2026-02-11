'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface ProviderRanking {
  name: string;
  deliveries: number;
  rating: number;
  completionRate: number;
}

interface DeliveryProviderRankingProps {
  data: ProviderRanking[];
}

export function DeliveryProviderRanking({ data }: DeliveryProviderRankingProps) {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-base md:text-lg font-semibold text-slate-900">Ranking de Proveedores</h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Bar dataKey="deliveries" fill="#3b82f6" name="Entregas" />
          <Bar dataKey="completionRate" fill="#10b981" name="% Completado" />
        </BarChart>
      </ResponsiveContainer>

      {/* Top Provider */}
      {data.length > 0 && (
        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-slate-200">
          <p className="text-xs md:text-sm text-slate-600 mb-2">Top Proveedor</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm md:text-base text-slate-900">{data[0].name}</p>
              <p className="text-xs md:text-sm text-slate-600">Rating: {data[0].rating.toFixed(1)}/5.0</p>
            </div>
            <div className="text-right">
              <p className="text-xl md:text-2xl font-bold text-blue-600">{data[0].deliveries}</p>
              <p className="text-xs text-slate-600">entregas</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
