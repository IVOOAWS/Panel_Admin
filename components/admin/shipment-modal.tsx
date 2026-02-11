'use client';

import React, { useState } from 'react';
import { ChevronDown, Eye, Edit2, Trash2, X } from 'lucide-react';

interface ShipmentDetails {
  trackingNumber: string;
  sender: {
    name: string;
    code: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
  };
  cost: number;
  weight: string;
  paymentType: string;
  description: string;
  destinationAgency: string;
  destinationCity: string;
  destinationState: string;
  qrCode: string;
}

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShipmentDetails;
}

export function ShipmentModal({ isOpen, onClose, data }: ShipmentModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto animate-slide-up">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Información del Envío</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-green-700 p-1 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Tracking */}
            <div className="text-center pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Número de Seguimiento</p>
              <p className="text-2xl font-bold text-green-700">{data.trackingNumber}</p>
            </div>

            {/* Two Column Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Emisor</label>
                  <p className="text-sm font-semibold text-gray-900">{data.sender.name}</p>
                  <p className="text-xs text-gray-600">{data.sender.code}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Receptor</label>
                  <p className="text-sm font-semibold text-gray-900">{data.receiver.name}</p>
                  <p className="text-xs text-gray-600">{data.receiver.address}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Teléfono del Receptor</label>
                  <p className="text-sm font-semibold text-gray-900">{data.receiver.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Costo</label>
                    <p className="text-sm font-semibold text-green-700">${data.cost}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Peso</label>
                    <p className="text-sm font-semibold text-gray-900">{data.weight}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Tipo de Cobro</label>
                  <p className="text-sm font-semibold text-gray-900">{data.paymentType}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Descripción</label>
                  <p className="text-sm font-semibold text-gray-900">{data.description}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Agencia Destino</label>
                  <p className="text-sm font-semibold text-gray-900">{data.destinationAgency}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Ciudad</label>
                    <p className="text-sm font-semibold text-gray-900">{data.destinationCity}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                    <p className="text-sm font-semibold text-gray-900">{data.destinationState}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Código QR</p>
                <div className="w-32 h-32 bg-gray-100 rounded border-2 border-gray-300 flex items-center justify-center">
                  <p className="text-xs text-gray-500">QR Code</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
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
