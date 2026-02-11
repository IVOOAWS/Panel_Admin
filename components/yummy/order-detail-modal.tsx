'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Star, MapPin, Phone, DollarSign } from 'lucide-react';

interface OrderDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function OrderDetailModal({
  open,
  onOpenChange,
  order,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Pedido - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Producto Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Información del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                    <img
                      src={order.productImage || "/placeholder.svg"}
                      alt="Producto"
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">Producto</p>
                    <p className="font-semibold text-slate-900">{order.productName}</p>
                    <p className="text-xs text-slate-600 mt-2">{order.productDescription}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-sm text-slate-600">Estado</p>
                <Badge className="mt-2 bg-green-100 text-green-800">{order.status}</Badge>

                <div className="mt-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-slate-900">{order.rating}/5.0</span>
                </div>
              </Card>
            </div>
          </div>

          {/* Precios */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Desglose de Precios</h3>
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Delivery</span>
                <span className="font-semibold text-slate-900">${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-lg text-blue-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Ruta */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Información de Entrega</h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Origen</p>
                  <p className="font-semibold text-slate-900">{order.originAddress}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Destino</p>
                  <p className="font-semibold text-slate-900">{order.destinationAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Conductor */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Conductor Asignado</h3>
            <Card className="p-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {order.driverName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{order.driverName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-slate-600" />
                    <p className="text-sm text-slate-600">{order.driverPhone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-slate-900">{order.driverRating}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Información del Vehículo */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Vehículo</h3>
            <Card className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Modelo</span>
                <span className="font-semibold text-slate-900">{order.vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Placa</span>
                <span className="font-mono font-semibold text-slate-900">{order.vehiclePlate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Color</span>
                <span className="font-semibold text-slate-900">{order.vehicleColor}</span>
              </div>
            </Card>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Información del Cliente</h3>
            <Card className="p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Nombre</span>
                <span className="font-semibold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Teléfono</span>
                <span className="font-semibold text-slate-900">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tipo</span>
                <Badge className={order.isThirdParty ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                  {order.isThirdParty ? 'Tercero' : 'Cliente Directo'}
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
