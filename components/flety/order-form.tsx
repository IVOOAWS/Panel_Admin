'use client';

import React from "react"

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: DeliveryOrder | null;
  onSubmit: (data: Partial<DeliveryOrder>) => void;
  type: 'regular' | 'express';
}

export function OrderForm({
  open,
  onOpenChange,
  order,
  onSubmit,
  type,
}: OrderFormProps) {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customer: '',
    destination: '',
    status: 'pending' as const,
    price: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        orderNumber: order.orderNumber,
        customer: order.customer,
        destination: order.destination,
        status: order.status,
        price: order.price.toString(),
      });
    } else {
      setFormData({
        orderNumber: '',
        customer: '',
        destination: '',
        status: 'pending',
        price: '',
      });
    }
  }, [order, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {order ? 'Editar Pedido' : 'Nuevo Pedido'} - {type === 'regular' ? 'Delivery Regular' : 'Delivery Express'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orderNumber" className="text-slate-700 font-medium">
              Número de Pedido
            </Label>
            <Input
              id="orderNumber"
              placeholder="ORD-001"
              value={formData.orderNumber}
              onChange={(e) =>
                setFormData({ ...formData, orderNumber: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer" className="text-slate-700 font-medium">
              Cliente
            </Label>
            <Input
              id="customer"
              placeholder="Nombre del cliente"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination" className="text-slate-700 font-medium">
              Dirección de Destino
            </Label>
            <Input
              id="destination"
              placeholder="Dirección completa"
              value={formData.destination}
              onChange={(e) =>
                setFormData({ ...formData, destination: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-700 font-medium">
              Precio
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-700 font-medium">
              Estado
            </Label>
            <Select value={formData.status} onValueChange={(value: any) =>
              setFormData({ ...formData, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="assigned">Asignado</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {order ? 'Guardar Cambios' : 'Crear Pedido'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
