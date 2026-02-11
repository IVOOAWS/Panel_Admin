'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customer: string;
  destination: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  price: number;
}

interface DeliveryOrdersTableProps {
  orders: DeliveryOrder[];
  type: 'regular' | 'express';
  onAddOrder: () => void;
  onEditOrder: (order: DeliveryOrder) => void;
  onDeleteOrder: (id: string) => void;
}

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

export function DeliveryOrdersTable({
  orders,
  type,
  onAddOrder,
  onEditOrder,
  onDeleteOrder,
}: DeliveryOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {type === 'regular' ? 'Delivery Regular' : 'Delivery Express'}
        </h3>
        <Button onClick={onAddOrder} className="gap-2">
          <Plus className="w-4 h-4" />
          Agregar Pedido
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200">
              <TableHead className="text-slate-700 font-semibold">Número</TableHead>
              <TableHead className="text-slate-700 font-semibold">Cliente</TableHead>
              <TableHead className="text-slate-700 font-semibold">Destino</TableHead>
              <TableHead className="text-slate-700 font-semibold">Estado</TableHead>
              <TableHead className="text-slate-700 font-semibold">Precio</TableHead>
              <TableHead className="text-slate-700 font-semibold">Creado</TableHead>
              <TableHead className="text-right text-slate-700 font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <TableCell className="font-mono text-sm text-slate-900">{order.orderNumber}</TableCell>
                <TableCell className="text-slate-700">{order.customer}</TableCell>
                <TableCell className="text-slate-700 max-w-xs truncate">{order.destination}</TableCell>
                <TableCell>
                  <Badge className={`${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-900">${order.price.toFixed(2)}</TableCell>
                <TableCell className="text-sm text-slate-600">{order.createdAt}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Detalles del Pedido</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-slate-600">Número de Pedido</p>
                              <p className="font-semibold text-slate-900">{selectedOrder.orderNumber}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Cliente</p>
                              <p className="font-semibold text-slate-900">{selectedOrder.customer}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Destino</p>
                              <p className="font-semibold text-slate-900">{selectedOrder.destination}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Estado</p>
                              <Badge className={`${statusColors[selectedOrder.status]} mt-1`}>
                                {statusLabels[selectedOrder.status]}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600">Precio</p>
                              <p className="font-semibold text-slate-900">${selectedOrder.price.toFixed(2)}</p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditOrder(order)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => onDeleteOrder(order.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No hay pedidos en esta categoría</p>
        </div>
      )}
    </Card>
  );
}
