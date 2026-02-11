'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStoreById } from '@/lib/stores-db';

interface Order {
  id: string;
  orderNumber: string;
  shippingCompany: 'Flety' | 'MRW' | 'Yummy';
  trackingNumber: string;
  qrCode: string;
  storeId?: number;
  sender: {
    name: string;
    code: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
  };
  description: string;
  weight: string;
  cost: number;
  successorLocation: string;
  total: number;
  date: string;
}

interface ShipmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const companyLogos: Record<'Flety' | 'MRW' | 'Yummy', string> = {
  'Flety': '🚚',
  'MRW': '📦',
  'Yummy': '🍕',
};

const companyColors: Record<'Flety' | 'MRW' | 'Yummy', string> = {
  'Flety': 'from-black to-gray-800',
  'MRW': 'from-black to-gray-800',
  'Yummy': 'from-black to-gray-800',
};

export function ShipmentDetailsModal({ isOpen, onClose, order }: ShipmentDetailsModalProps) {
  const [showQR, setShowQR] = useState(true);

  if (!isOpen) return null;

  const companyColor = companyColors[order.shippingCompany];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className={`bg-gradient-to-r ${companyColor} px-8 py-6 flex items-center justify-between text-white`}>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{companyLogos[order.shippingCompany]}</div>
              <div>
                <h2 className="text-xl font-bold">¡Nos movemos por ti!</h2>
                <p className="text-white/80 text-sm">{order.shippingCompany}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Tracking Number */}
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-semibold uppercase">Número de Seguimiento</p>
              <p className="text-3xl font-bold text-black font-mono">{order.trackingNumber}</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Information */}
              <div className="space-y-6">
                {/* Sender */}
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Emisor</label>
                  <p className="text-sm font-semibold text-black">{order.sender.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Código: {order.sender.code}</p>
                </div>

                {/* Receiver */}
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Receptor</label>
                  <p className="text-sm font-semibold text-black">{order.receiver.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{order.receiver.address}</p>
                  <p className="text-xs text-gray-600 mt-2">Teléfono: {order.receiver.phone}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Costo</label>
                    <p className="text-lg font-bold text-green-600">
                      ${order.cost.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Peso</label>
                    <p className="text-sm font-semibold text-black">{order.weight}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                  <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Descripción</label>
                  <p className="text-sm text-black">{order.description}</p>
                </div>

                {/* Order Details */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Orden</label>
                      <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase block mb-1">Fecha</label>
                      <p className="text-sm font-semibold text-gray-900">{order.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gray-100 p-8 rounded-lg border-4 border-dashed border-gray-300 mb-6">
                  <div className="w-48 h-48 bg-white rounded flex items-center justify-center border-2 border-gray-300">
                    {/* QR Code Placeholder - In production, generate with qrcode library */}
                    <div className="text-center">
                      <p className="text-4xl mb-2">📱</p>
                      <p className="text-xs text-gray-600 font-mono">{order.trackingNumber}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-semibold">Tracking:</span> {order.trackingNumber}
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Escanea este código QR para rastrear tu envío
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {order.storeId && getStoreById(order.storeId) && (
                  <div>
                    <p className="text-xs text-gray-600 uppercase font-semibold">Tienda de Origen</p>
                    <p className="text-sm font-semibold text-black">{getStoreById(order.storeId)?.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{getStoreById(order.storeId)?.city}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Sucursal</p>
                  <p className="text-sm font-semibold text-black">{order.successorLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Total Orden</p>
                  <p className="text-sm font-semibold text-black">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Empresa</p>
                  <p className="text-sm font-semibold text-black">{order.shippingCompany}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Cerrar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Etiqueta
            </Button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fade-in) {
          animation: fade-in 0.2s ease-out;
        }

        :global(.animate-slide-up) {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
