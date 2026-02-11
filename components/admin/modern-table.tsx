'use client';

import React, { useState } from 'react';
import { Eye, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { ShipmentModal } from './shipment-modal';

interface TableRow {
  id: string;
  number: string;
  customer: string;
  destination: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  date: string;
  price: number;
  details: any;
}

interface ModernTableProps {
  data: TableRow[];
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
  }>;
  title?: string;
  onEdit?: (row: TableRow) => void;
  onDelete?: (row: TableRow) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  in_transit: { label: 'En Tránsito', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  delivered: { label: 'Entregado', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  cancelled: { label: 'Cancelado', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export function ModernTable({ data, columns, title, onEdit, onDelete }: ModernTableProps) {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewDetails = (row: TableRow) => {
    setSelectedRow(row);
    setModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {title && (
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-green-700 rounded-full" />
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Header */}
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        {col.sortable && <ChevronDown className="w-4 h-4 opacity-50" />}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Acción
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-green-50/30 transition-colors duration-200 animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {columns.map((col) => (
                      <td key={`${row.id}-${col.key}`} className="px-6 py-4">
                        {col.key === 'status' ? (
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                              statusConfig[row.status as keyof typeof statusConfig]?.bg
                            } ${statusConfig[row.status as keyof typeof statusConfig]?.text} ${
                              statusConfig[row.status as keyof typeof statusConfig]?.border
                            }`}
                          >
                            {statusConfig[row.status as keyof typeof statusConfig]?.label}
                          </div>
                        ) : col.key === 'price' ? (
                          <span className="font-semibold text-green-700">${row.price.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-900">{(row as any)[col.key]}</span>
                        )}
                      </td>
                    ))}

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(row)}
                          className="p-2 text-green-700 hover:bg-green-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 transform hover:scale-110"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedRow && (
        <ShipmentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          data={{
            trackingNumber: selectedRow.number,
            sender: {
              name: 'IVOO Comercio',
              code: 'J-3500269358',
            },
            receiver: {
              name: selectedRow.customer,
              address: selectedRow.destination,
              phone: '+58-412-1234567',
            },
            cost: selectedRow.price,
            weight: '2.5 Kg',
            paymentType: 'GRATIS',
            description: 'Producto comercial',
            destinationAgency: '0307000',
            destinationCity: selectedRow.destination,
            destinationState: 'Caracas',
            qrCode: selectedRow.number,
          }}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.animate-fade-in) {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
