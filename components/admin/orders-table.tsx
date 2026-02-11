'use client';

import { useState, useEffect, useMemo } from 'react'; // Se agregó useMemo
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Filter } from 'lucide-react';
import { ShipmentDetailsModal } from './shipment-details-modal';
import { FiltersModal } from './filters-modal';
import { getStoreById } from '@/lib/stores-db';

export interface Order {
  id: string;
  orderNumber: string;
  channel: string;
  successorLocation: string;
  invoiceNumber: string;
  date: string;
  total: number;
  paymentStatus: 'pending' | 'completed';
  deliveryStatus: 'pending' | 'in_progress' | 'delivered' | 'in_store' | 'in_route' | 'ACCEPTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  shippingCompany: 'Flety' | 'MRW' | 'Yummy';
  trackingNumber: string;
  qrCode: string;
  storeId?: number;
  sender: { name: string; code: string; };
  receiver: { name: string; address: string; phone: string; };
  description: string;
  weight: string;
  cost: number;
}

interface OrdersTableProps {
  orders: Order[];
  title: string;
  loading?: boolean;
  filterCompany?: string; // Prop opcional para filtrar por empresa automáticamente
  filterDeliveryStatus?: string; // Prop para sincronizar con los Tabs de Yummy
}

const paymentStatusColors = {
  pending: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
};

const paymentStatusLabels = {
  pending: 'Pendiente',
  completed: 'Completado',
};

const deliveryStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  in_store: 'bg-purple-100 text-purple-800',
  in_route: 'bg-orange-100 text-orange-800',
  // Estatus de la API de Yummy
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function OrdersTable({ orders = [], title, loading, filterCompany: initialCompany = 'all', filterDeliveryStatus: initialStatus = 'all' }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  
  const [searchInvoice, setSearchInvoice] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterDeliveryStatus, setFilterDeliveryStatus] = useState(initialStatus);
  const [filterCompany, setFilterCompany] = useState(initialCompany);
  const [filterStore, setFilterStore] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sincronizar filtros externos (como los Tabs de la página de Yummy)
  useEffect(() => {
    if (initialStatus !== 'all') setFilterDeliveryStatus(initialStatus);
  }, [initialStatus]);

  // ÚNICA DECLARACIÓN DE filteredOrders usando useMemo para rendimiento
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    return orders.filter(order => {
      const companyMatch = filterCompany === 'all' || order.shippingCompany === filterCompany;
      const statusMatch = filterDeliveryStatus === 'all' || order.deliveryStatus === filterDeliveryStatus;
      const invoiceMatch = !searchInvoice || order.invoiceNumber?.toLowerCase().includes(searchInvoice.toLowerCase());
      const orderMatch = !searchOrder || order.orderNumber?.toLowerCase().includes(searchOrder.toLowerCase());
      const paymentMatch = filterPaymentStatus === 'all' || order.paymentStatus === filterPaymentStatus;
      const storeMatch = filterStore === 'all' || order.storeId === parseInt(filterStore);

      return companyMatch && statusMatch && invoiceMatch && orderMatch && paymentMatch && storeMatch;
    });
  }, [orders, searchInvoice, searchOrder, filterPaymentStatus, filterDeliveryStatus, filterCompany, filterStore]);

  // Lógica de paginación segura
  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    return (filteredOrders || []).slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredOrders, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center animate-pulse">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-slate-600 text-sm font-bold">Cargando flota...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="p-4 md:p-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg md:text-xl font-bold text-black dark:text-white uppercase tracking-tight">{title}</h3>
          <Button onClick={() => setIsFiltersModalOpen(true)} className="w-full sm:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold">
            <Filter className="w-4 h-4" /> Filtros Avanzados
          </Button>
        </div>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 border-b-2 dark:border-slate-700">
                <TableHead className="font-bold text-black dark:text-white text-[10px] uppercase">Canal</TableHead>
                <TableHead className="font-bold text-black dark:text-white text-[10px] uppercase"># Orden</TableHead>
                <TableHead className="font-bold text-black dark:text-white text-[10px] uppercase">Tienda</TableHead>
                <TableHead className="font-bold text-black dark:text-white text-[10px] uppercase">Factura</TableHead>
                <TableHead className="font-bold text-black dark:text-white text-[10px] uppercase">Total</TableHead>
                <TableHead className="font-bold text-black dark:text-white text-[10px] uppercase">Estatus</TableHead>
                <TableHead className="text-right font-bold text-black dark:text-white text-[10px] uppercase">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-green-50/50 dark:hover:bg-slate-800/50 border-b dark:border-slate-700 transition-colors">
                  <TableCell className="text-sm font-medium dark:text-slate-300">{order.channel}</TableCell>
                  <TableCell className="font-mono text-xs font-bold dark:text-slate-300">{order.orderNumber}</TableCell>
                  <TableCell className="text-sm dark:text-slate-300">
                    {order.storeId ? getStoreById(order.storeId)?.city : 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-slate-400">{order.invoiceNumber}</TableCell>
                  <TableCell className="font-black text-green-700 dark:text-green-400">${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={`${deliveryStatusColors[order.deliveryStatus] || 'bg-gray-100'} text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none dark:opacity-90`}>
                      {order.deliveryStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="hover:text-green-600 dark:hover:text-green-400">
                      <Eye size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View - Visible only on mobile */}
        <div className="md:hidden space-y-4">
          {paginatedOrders.map((order) => (
            <div key={order.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">ORDEN</p>
                  <p className="text-base font-bold text-black dark:text-white font-mono">{order.orderNumber}</p>
                </div>
                <Badge className={`${deliveryStatusColors[order.deliveryStatus] || 'bg-gray-100'} text-[9px] font-black uppercase px-2 py-0.5 rounded-full border-none dark:opacity-90`}>
                  {order.deliveryStatus}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">CANAL</p>
                  <p className="text-black dark:text-white font-semibold">{order.channel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">TIENDA</p>
                  <p className="text-black dark:text-white font-semibold">{order.storeId ? getStoreById(order.storeId)?.city : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">FACTURA</p>
                  <p className="text-black dark:text-white font-semibold text-xs">{order.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">TOTAL</p>
                  <p className="text-green-700 dark:text-green-400 font-black">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <Button 
                size="sm" 
                onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold gap-2"
              >
                <Eye size={16} /> Ver Detalles
              </Button>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 bg-gray-50/50 dark:bg-slate-800/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 mt-4">
            <p className="text-gray-400 dark:text-slate-400 font-bold uppercase text-xs">Sin registros que coincidan con la búsqueda</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t dark:border-slate-700">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-400">PÁGINA {currentPage} DE {totalPages}</span>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="flex-1 sm:flex-none dark:bg-slate-800 dark:border-slate-600 dark:text-white">Anterior</Button>
              <Button size="sm" className="flex-1 sm:flex-none bg-green-600 text-white hover:bg-green-700 border-none font-semibold" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Siguiente</Button>
            </div>
          </div>
        )}
      </Card>

      {selectedOrder && (
        <ShipmentDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} order={selectedOrder} />
      )}
      
      <FiltersModal
        isOpen={isFiltersModalOpen}
        onClose={() => setIsFiltersModalOpen(false)}
        currentFilters={{ searchInvoice, searchOrder, filterPaymentStatus, filterDeliveryStatus, filterCompany, filterStore }}
        onApply={(f) => {
          setSearchInvoice(f.searchInvoice);
          setSearchOrder(f.searchOrder);
          setFilterPaymentStatus(f.filterPaymentStatus);
          setFilterDeliveryStatus(f.filterDeliveryStatus);
          setFilterCompany(f.filterCompany);
          setFilterStore(f.filterStore);
          setCurrentPage(1);
        }}
      />
    </>
  );
}
