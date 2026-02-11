'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Banknote, DollarSign, Zap, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { PaymentMethod } from '@/lib/payment-shipping-db';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  Wallet,
  Banknote,
  DollarSign,
  Zap,
};

export function PaymentMethodsSection() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-methods');
      const data = await response.json();

      if (data.success) {
        setMethods(data.data);
      } else {
        setError('Error al cargar métodos de pago');
      }
    } catch (err) {
      console.error('[v0] Error fetching payment methods:', err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMethod = async (id: number, currentStatus: boolean) => {
    try {
      setUpdating(id);
      const response = await fetch('/api/payment-methods', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isEnabled: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMethods(
          methods.map((m) =>
            m.id === id ? { ...m, isEnabled: !currentStatus } : m
          )
        );
        setSuccessMessage(
          `Método de pago ${!currentStatus ? 'habilitado' : 'deshabilitado'}`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Error al actualizar método');
      }
    } catch (err) {
      console.error('[v0] Error toggling payment method:', err);
      setError('Error de conexión al servidor');
    } finally {
      setUpdating(null);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || CreditCard;
    return Icon;
  };

  if (loading) {
    return (
      <Card className="p-8 bg-white">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Cargando métodos de pago...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Métodos de Pago</h2>
        <p className="text-gray-600">
          Administra los métodos de pago disponibles para los clientes
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 hover:text-red-600 mt-1"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="font-medium text-green-900">{successMessage}</p>
        </div>
      )}

      {/* Payment Methods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => {
          const Icon = getIcon(method.icon);
          const isUpdating = updating === method.id;

          return (
            <Card
              key={method.id}
              className={`p-6 border-2 transition-all ${
                method.isEnabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    method.isEnabled ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon
                      className={`w-6 h-6 ${
                        method.isEnabled ? 'text-green-600' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {method.description}
                    </p>
                  </div>
                </div>
                <Badge
                  className={
                    method.isEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {method.isEnabled ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Comisión
                  </p>
                  <p className="font-semibold text-gray-900">
                    {method.commission}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Monto Máximo
                  </p>
                  <p className="font-semibold text-gray-900">
                    ${method.maxAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => handleToggleMethod(method.id, method.isEnabled)}
                disabled={isUpdating}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  method.isEnabled
                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                }`}
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Actualizando...</span>
                  </div>
                ) : method.isEnabled ? (
                  <>
                    <XCircle className="w-4 h-4 inline mr-2" />
                    Deshabilitar
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 inline mr-2" />
                    Habilitar
                  </>
                )}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
