'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Eye } from 'lucide-react';

interface OrderCardProps {
  order: any;
  onViewDetails: () => void;
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  const statusColors = {
    pending: 'bg-slate-100 text-slate-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-amber-100 text-amber-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'Pendiente',
    assigned: 'Asignado',
    in_transit: 'En Tránsito',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Producto Image */}
        <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
          <img
            src={order.productImage || "/placeholder.svg"}
            alt="Producto"
            className="w-20 h-20 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Contenido */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-mono text-sm text-slate-600">{order.orderNumber}</p>
              <p className="font-semibold text-slate-900">{order.productName}</p>
            </div>
            <Badge className={`${statusColors[order.status as keyof typeof statusColors]} flex-shrink-0`}>
              {statusLabels[order.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          <div className="space-y-1 text-sm mb-3">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{order.destinationAddress}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-semibold text-slate-900">Cliente:</span>
              <span>{order.customerName}</span>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>${order.total.toFixed(2)}</span>
            </div>
            <Button size="sm" variant="outline" onClick={onViewDetails}>
              <Eye className="w-4 h-4" />
              Ver Detalles
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
