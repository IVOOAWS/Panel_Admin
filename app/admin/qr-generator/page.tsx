'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Trash2, Eye, Truck, MapPin, Package } from 'lucide-react';
import { OrderQRModal } from '@/components/order-qr-modal';

interface Order {
  id: number;
  order_number: string;
  customer_name?: string;
  status_code?: string;
  grand_total?: number;
  currency?: string;
  created_at?: string;
  items_count?: number;
  shipping_method?: string;
  origin_address?: string;
  destination_address?: string;
}

interface QROrder extends Order {
  _id: string;
}

export default function QRGeneratorPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/inventory/orders');
        const data = await response.json();
        if (data.success) {
          setAllOrders(data.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csv = allOrders.map(order => 
      `"${order.order_number}","${order.customer_name || ''}","${order.shipping_method || ''}","${order.grand_total || 0}","${order.status_code || ''}"`
    ).join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent('Orden,Cliente,Método,Total,Estado\n' + csv));
    element.setAttribute('download', `ordenes-qr-${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Generador de Códigos QR</h1>
        <p className="text-blue-100">Visualiza y genera códigos QR para todas tus órdenes de envío</p>
      </div>

      {/* Actions Bar */}
      {allOrders.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button onClick={handleDownloadCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Descargar CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">Cargando órdenes...</p>
        </Card>
      ) : allOrders.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No hay órdenes disponibles</p>
          <p className="text-gray-400 text-sm mt-1">Las órdenes aparecerán aquí automáticamente</p>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Órdenes ({allOrders.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Orden</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Cliente</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Tipo</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Origen</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Total</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Estado</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="py-4 px-4">
                        <p className="font-bold text-blue-600 font-mono">{order.order_number}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at || '').toLocaleDateString('es-ES')}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900">{order.customer_name || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {order.shipping_method === 'delivery' ? (
                            <>
                              <Truck className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-medium">Entrega</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium">Recogida</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 line-clamp-1">{order.origin_address || 'N/A'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-green-600">{order.grand_total?.toFixed(2)} {order.currency || 'USD'}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge className={`${getStatusColor(order.status_code || '')} font-semibold`}>
                          {order.status_code?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                          title="Ver detalles y QR"
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order QR Modal */}
      <OrderQRModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        order={selectedOrder}
      />
    </div>
  );
}
