'use client';

import { useState, useEffect } from 'react';
import { X, Download, Printer, Package, MapPin, User, Calendar, DollarSign, Truck, Navigation, FileText, Zap, MapIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderItem {
  id?: number;
  sku: string;
  name: string;
  qty_ordered: number;
  unit_price: number;
  currency: string;
}

interface OrderInfo {
  id?: number;
  order_number: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer?: {
    full_name?: string;
    document_number?: string;
    email?: string;
    phone?: string;
  };
  status_code?: string;
  status?: string;
  state?: string;
  source?: string;
  grand_total?: number;
  currency?: string;
  created_at?: string;
  shipping_method?: string;
  shipping_service?: string;
  shipping_provider_id?: string;
  shipping_amount?: number;
  payment_fee?: number;
  is_musculito?: boolean;
  origin_address?: string;
  origin_city?: string;
  origin_state?: string;
  origin_country?: string;
  origin_postal_code?: string;
  origin_name?: string;
  origin_code?: string;
  origin_type?: string;
  origin_address_line1?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_address?: string;
  destination_city?: string;
  destination_state?: string;
  destination_country?: string;
  destination_postal_code?: string;
  destination_name?: string;
  destination_type?: string;
  destination_address_line1?: string;
  destination_lat?: number;
  destination_lng?: number;
  items?: OrderItem[];
}

interface OrderQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderInfo | null;
}

export function OrderQRModal({ isOpen, onClose, order }: OrderQRModalProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [detailedOrder, setDetailedOrder] = useState<OrderInfo | null>(null);

  useEffect(() => {
    if (isOpen && order) {
      setLoading(true);
      generateQR();
      fetchDetailedOrder();
    }
  }, [isOpen, order?.id]);

  const fetchDetailedOrder = async () => {
    if (!order?.id) return;
    try {
      const response = await fetch(`/api/inventory/orders/details?id=${order.id}`);
      const data = await response.json();
      if (data.success) {
        setDetailedOrder({ ...order, ...data.data });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setDetailedOrder(order);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    if (!order) return;
    try {
      const response = await fetch('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(order.order_number));
      setQrCode(response.url);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QR-${order?.order_number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen || !order) return null;

  const displayOrder = detailedOrder || order;
  const statusColorMap: Record<string, string> = {
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusColor = statusColorMap[displayOrder.status_code?.toLowerCase() || 'pending'] || 'bg-gray-100 text-gray-800';

  // Helper functions
  const getCustomerName = () => {
    return displayOrder.customer?.full_name || displayOrder.customer_name || 'N/A';
  };

  const getCustomerEmail = () => {
    return displayOrder.customer?.email || displayOrder.customer_email || 'N/A';
  };

  const getCustomerPhone = () => {
    return displayOrder.customer?.phone || displayOrder.customer_phone || 'N/A';
  };

  const getOriginAddress = () => {
    return displayOrder.origin_address_line1 || displayOrder.origin_address || 'N/A';
  };

  const getDestinationAddress = () => {
    return displayOrder.destination_address_line1 || displayOrder.destination_address || 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Información de la Orden</h2>
            <p className="text-blue-100 text-xl font-mono font-bold">{displayOrder.order_number}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* QR Code & Key Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* QR Code */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="bg-white border-4 border-gray-300 p-4 rounded-lg shadow-lg mb-4">
                {loading ? (
                  <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                    <p className="text-gray-500 text-center text-xs">Cargando QR...</p>
                  </div>
                ) : (
                  <img src={qrCode} alt={`QR ${displayOrder.order_number}`} className="w-48 h-48" />
                )}
              </div>
              <p className="text-center text-xs text-gray-600 font-semibold">CÓDIGO DE SEGUIMIENTO</p>
              <p className="text-center text-xs font-mono font-bold text-gray-900 mt-1">{displayOrder.order_number}</p>
            </div>

            {/* Key Metrics */}
            <div className="md:col-span-2 space-y-3">
              {/* Status & State */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Estado Principal</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                    {displayOrder.status_code?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Detalle</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{displayOrder.state || 'N/A'}</p>
                </div>
              </div>

              {/* Total & Currency */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 font-semibold mb-2">Monto Total</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-green-600">{displayOrder.grand_total?.toFixed(2)}</p>
                  <p className="text-lg font-semibold text-green-700">{displayOrder.currency || 'USD'}</p>
                </div>
              </div>

              {/* Source & Fecha */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Fuente</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{displayOrder.source || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Fecha</p>
                  <p className="text-sm font-bold text-gray-900">
                    {displayOrder.created_at ? new Date(displayOrder.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">INFORMACIÓN DEL CLIENTE</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Nombre Completo</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{getCustomerName()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Cédula/ID</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{displayOrder.customer?.document_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Email</p>
                <p className="text-sm font-bold text-gray-900 break-all mt-1">{getCustomerEmail()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Teléfono</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{getCustomerPhone()}</p>
              </div>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">DETALLES DE ENVÍO</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Método</p>
                <p className="text-sm font-bold text-gray-900 capitalize mt-1">{displayOrder.shipping_method || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Servicio</p>
                <p className="text-sm font-bold text-gray-900 capitalize mt-1">{displayOrder.shipping_service || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Proveedor</p>
                <p className="text-sm font-bold text-gray-900 capitalize mt-1">{displayOrder.shipping_provider_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Monto Envío</p>
                <p className="text-sm font-bold text-gray-900 mt-1">${displayOrder.shipping_amount?.toFixed(2) || '0.00'} {displayOrder.currency || 'USD'}</p>
              </div>
            </div>
            {displayOrder.is_musculito && (
              <div className="mt-3 pt-3 border-t border-orange-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <p className="text-xs font-semibold text-orange-700">Este envío requiere personal especializado (Musculito)</p>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">DESGLOSE DE COSTOS</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                <p className="text-sm text-gray-700">Costo de Productos</p>
                <p className="font-bold text-gray-900">${(displayOrder.grand_total! - (displayOrder.shipping_amount || 0) - (displayOrder.payment_fee || 0)).toFixed(2)}</p>
              </div>
              {displayOrder.shipping_amount && displayOrder.shipping_amount > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                  <p className="text-sm text-gray-700">Costo de Envío</p>
                  <p className="font-bold text-gray-900">${displayOrder.shipping_amount.toFixed(2)}</p>
                </div>
              )}
              {displayOrder.payment_fee && displayOrder.payment_fee > 0 && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                  <p className="text-sm text-gray-700">Comisión de Pago</p>
                  <p className="font-bold text-gray-900">${displayOrder.payment_fee.toFixed(2)}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm font-bold text-gray-900">TOTAL A PAGAR</p>
                <p className="text-2xl font-bold text-green-600">${displayOrder.grand_total?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-purple-600" />
              DIRECCIONES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin */}
              <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
                <p className="text-xs font-semibold uppercase text-blue-700 mb-3">Punto de Origen</p>
                {displayOrder.origin_code && (
                  <p className="text-xs text-gray-600 mb-2">
                    <span className="font-bold">Código:</span> {displayOrder.origin_code}
                  </p>
                )}
                <p className="font-bold text-gray-900 text-sm mb-2">{displayOrder.origin_name || 'N/A'}</p>
                {displayOrder.origin_type && (
                  <p className="text-xs text-gray-600 mb-2 capitalize">
                    <span className="font-bold">Tipo:</span> {displayOrder.origin_type}
                  </p>
                )}
                <p className="text-sm text-gray-700 mb-2">{getOriginAddress()}</p>
                {displayOrder.origin_city && (
                  <p className="text-sm text-gray-700 mb-2">
                    {displayOrder.origin_city}
                    {displayOrder.origin_state ? `, ${displayOrder.origin_state}` : ''}
                  </p>
                )}
                {displayOrder.origin_postal_code && (
                  <p className="text-sm text-gray-700 mb-2">CP: {displayOrder.origin_postal_code}</p>
                )}
                {displayOrder.origin_country && (
                  <p className="text-sm text-gray-700 font-semibold capitalize mb-2">{displayOrder.origin_country}</p>
                )}
                {displayOrder.origin_lat && displayOrder.origin_lng && (
                  <div className="text-xs text-gray-600 pt-2 border-t border-blue-200">
                    <p>📍 {displayOrder.origin_lat.toFixed(4)}, {displayOrder.origin_lng.toFixed(4)}</p>
                  </div>
                )}
              </div>

              {/* Destination - Only for Delivery */}
              {displayOrder.shipping_method === 'delivery' && (
                <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-200">
                  <p className="text-xs font-semibold uppercase text-orange-700 mb-3">Punto de Destino</p>
                  <p className="font-bold text-gray-900 text-sm mb-2">{displayOrder.destination_name || 'N/A'}</p>
                  {displayOrder.destination_type && (
                    <p className="text-xs text-gray-600 mb-2 capitalize">
                      <span className="font-bold">Tipo:</span> {displayOrder.destination_type}
                    </p>
                  )}
                  <p className="text-sm text-gray-700 mb-2">{getDestinationAddress()}</p>
                  {displayOrder.destination_city && (
                    <p className="text-sm text-gray-700 mb-2">
                      {displayOrder.destination_city}
                      {displayOrder.destination_state ? `, ${displayOrder.destination_state}` : ''}
                    </p>
                  )}
                  {displayOrder.destination_postal_code && (
                    <p className="text-sm text-gray-700 mb-2">CP: {displayOrder.destination_postal_code}</p>
                  )}
                  {displayOrder.destination_country && (
                    <p className="text-sm text-gray-700 font-semibold capitalize mb-2">{displayOrder.destination_country}</p>
                  )}
                  {displayOrder.destination_lat && displayOrder.destination_lng && (
                    <div className="text-xs text-gray-600 pt-2 border-t border-orange-200">
                      <p>📍 {displayOrder.destination_lat.toFixed(4)}, {displayOrder.destination_lng.toFixed(4)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Pickup Notice */}
              {displayOrder.shipping_method === 'pickup' && (
                <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
                  <p className="text-xs font-semibold uppercase text-green-700 mb-3">Tipo de Servicio</p>
                  <div className="flex items-start gap-3">
                    <Package className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-2">RECOGIDA EN PUNTO DE ORIGEN</p>
                      <p className="text-sm text-gray-700">El cliente recogerá su pedido en el punto de origen indicado</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items/Products */}
          {displayOrder.items && displayOrder.items.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                ARTÍCULOS DEL ENVÍO ({displayOrder.items.length})
              </h3>
              <div className="space-y-2">
                {displayOrder.items.map((item, index) => (
                  <div key={item.sku || index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-indigo-300 transition">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-2">
                        <p className="font-bold text-gray-900 text-sm mb-1">{item.name}</p>
                        <p className="text-xs text-gray-600">SKU: {item.sku}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">CANTIDAD</p>
                        <p className="font-bold text-gray-900">{item.qty_ordered} unidad(es)</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">PRECIO UNIT.</p>
                        <p className="font-bold text-gray-900">${item.unit_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1">SUBTOTAL</p>
                        <p className="font-bold text-indigo-600">${(item.unit_price * item.qty_ordered).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6">
            <p className="text-center text-xs text-gray-500 mb-4">© 2024. Todos los derechos reservados - Sistema de Gestión de Órdenes IVOO</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="flex items-center gap-2 px-6"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!qrCode}
                variant="outline"
                className="flex items-center gap-2 px-6"
              >
                <Download className="w-4 h-4" />
                Descargar QR
              </Button>
              <Button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
