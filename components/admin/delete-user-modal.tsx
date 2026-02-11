'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'operator' | 'driver' | 'support';
  phone?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface DeleteUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({ isOpen, user, onClose, onConfirm }: DeleteUserModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-sm w-full shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Eliminar Usuario
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            ¿Está seguro de que desea eliminar al usuario <strong>{user.full_name}</strong>?
          </p>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
            <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              <strong>Email:</strong> {user.email}
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Esta acción no se puede deshacer. El usuario será desactivado.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-3 p-6 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
