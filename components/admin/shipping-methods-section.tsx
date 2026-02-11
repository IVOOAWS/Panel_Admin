'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Store, Globe, AlertCircle, CheckCircle2, XCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import type { ShippingMethod } from '@/lib/payment-shipping-db';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Truck,
  Store,
  Globe,
};

export function ShippingMethodsSection() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchShippingMethods();
  }, []);

  const fetchShippingMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/shipping-methods');
      const data = await response.json();

      if (data.success) {
        setMethods(data.data);
      } else {
        setError('Error al cargar métodos de envío');
      }
    } catch (err) {
      console.error('[v0] Error fetching shipping methods:', err);
      setError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMethod = async (id: number, currentStatus: boolean) => {
    try {
      setUpdating(id);
      const response = await fetch('/api/shipping-methods', {
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
          `Método de envío ${!currentStatus ? 'habilitado' : 'deshabilitado'}`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.error || 'Error al actualizar método');
      }
    } catch (err) {
      console.error('[v0] Error toggling shipping method:', err);
      setError('Error de conexión al servidor');
    } finally {
      setUpdating(null);
    }
  };

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Truck;
    return Icon;
  };

  if (loading) {
    return (
      <Card className="p-8 bg-white">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Cargando métodos de envío...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Métodos de Envío</h2>
        <p className="text-gray-600">
          Administra los métodos de envío disponibles para los clientes
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

      {/* Shipping Methods Grid */}
      <div className="grid grid-cols-1 gap-4">
        {methods.map((method) => {
          const Icon = getIcon(method.icon);
          const isUpdating = updating === method.id;
          const priorityLabel = method.priority === 0 ? 'Recogida' : `Prioridad ${method.priority}`;

          return (
            <Card
              key={method.id}
              className={`p-6 border-2 transition-all ${
                method.isEnabled
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Method Info */}
                <div className="md:col-span-2">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        method.isEnabled ? 'bg-green-100' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${
                          method.isEnabled ? 'text-green-600' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{method.name}</h3>
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
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-3 md:col-span-2">
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Costo
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      ${method.baseCost}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Días
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {method.estimatedDays === 0 ? 'Inmediato' : `${method.estimatedDays} día${method.estimatedDays !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 uppercase font-semibold">
                      Prioridad
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {priorityLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="mb-6 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600 uppercase font-semibold mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Áreas de Servicio
                </p>
                <div className="flex flex-wrap gap-2">
                  {method.serviceAreas.map((area, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-blue-800">
                      {area}
                    </Badge>
                  ))}
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
