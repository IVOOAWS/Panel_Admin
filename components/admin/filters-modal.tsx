'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Store } from '@/lib/stores-db';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

export interface FilterValues {
  searchInvoice: string;
  searchOrder: string;
  filterPaymentStatus: string;
  filterDeliveryStatus: string;
  filterCompany: string;
  filterStore: string;
}

export function FiltersModal({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}: FiltersModalProps) {
  const [filters, setFilters] = useState<FilterValues>(currentFilters);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStores();
    }
  }, [isOpen]);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setStores(data.data);
      }
    } catch (error) {
      console.error('[v0] Error fetching stores:', error);
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const emptyFilters: FilterValues = {
      searchInvoice: '',
      searchOrder: '',
      filterPaymentStatus: 'all',
      filterDeliveryStatus: 'all',
      filterCompany: 'all',
      filterStore: 'all',
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-black text-xl">Filtrar Órdenes</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Por # de factura
            </label>
            <Input
              placeholder="Ingresa # de factura"
              value={filters.searchInvoice}
              onChange={(e) =>
                setFilters({ ...filters, searchInvoice: e.target.value })
              }
              className="bg-white border-gray-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Por # de orden
            </label>
            <Input
              placeholder="Ingresa # de orden"
              value={filters.searchOrder}
              onChange={(e) =>
                setFilters({ ...filters, searchOrder: e.target.value })
              }
              className="bg-white border-gray-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Estado de pagos
            </label>
            <Select
              value={filters.filterPaymentStatus}
              onValueChange={(value) =>
                setFilters({ ...filters, filterPaymentStatus: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Estado de entrega
            </label>
            <Select
              value={filters.filterDeliveryStatus}
              onValueChange={(value) =>
                setFilters({ ...filters, filterDeliveryStatus: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_store">En Tienda</SelectItem>
                <SelectItem value="in_route">En Vía</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Empresa de envío
            </label>
            <Select
              value={filters.filterCompany}
              onValueChange={(value) =>
                setFilters({ ...filters, filterCompany: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Flety">Flety</SelectItem>
                <SelectItem value="MRW">MRW</SelectItem>
                <SelectItem value="Yummy">Yummy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Tienda de Origen
            </label>
            <Select
              value={filters.filterStore}
              onValueChange={(value) =>
                setFilters({ ...filters, filterStore: value })
              }
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tiendas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 text-black border-gray-300 hover:bg-gray-50"
          >
            Limpiar
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 text-black border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Aplicar Filtros
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
