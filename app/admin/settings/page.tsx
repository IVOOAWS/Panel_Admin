'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { PaymentMethodsSection } from '@/components/admin/payment-methods-section';
import { ShippingMethodsSection } from '@/components/admin/shipping-methods-section';
import { Settings, CreditCard, Truck } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'payment' | 'shipping'>('payment');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-600 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Configuración de Métodos
              </h1>
              <p className="text-gray-600">
                Administra los métodos de pago y envío disponibles en IVOO
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'payment'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600 hover:text-green-600'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Métodos de Pago
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'shipping'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-green-600 hover:text-green-600'
            }`}
          >
            <Truck className="w-5 h-5" />
            Métodos de Envío
          </button>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 p-4 bg-blue-50 border border-blue-200">
          <div className="flex gap-3">
            <div className="text-blue-600 flex-shrink-0">
              <svg
                className="w-5 h-5 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Los cambios se sincronizan automáticamente con tu API de IVOOAPP
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Los clientes verán solo los métodos habilitados en la plataforma
              </p>
            </div>
          </div>
        </Card>

        {/* Content */}
        <div>
          {activeTab === 'payment' && <PaymentMethodsSection />}
          {activeTab === 'shipping' && <ShippingMethodsSection />}
        </div>
      </div>
    </main>
  );
}
