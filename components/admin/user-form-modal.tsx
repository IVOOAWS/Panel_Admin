'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSave: () => void;
}

export default function UserFormModal({ isOpen, onClose, user, onSave }: UserFormModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'operator' as const,
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // No mostrar contraseña
        full_name: user.full_name,
        role: user.role,
        phone: user.phone || '',
      });
    } else {
      setFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'operator',
        phone: '',
      });
    }
    setError(null);
  }, [user, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const bearerToken = localStorage.getItem('bearerToken');
      if (!bearerToken) {
        setError('No hay autenticación');
        return;
      }

      const url = user ? `/api/admin/users/${user.id}` : '/api/admin/users';
      const method = user ? 'PUT' : 'POST';

      const payload: any = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role,
        phone: formData.phone || null,
      };

      // Solo incluir contraseña si es nuevo usuario o si se proporciona
      if (!user || formData.password) {
        if (!formData.password && !user) {
          setError('La contraseña es requerida para nuevos usuarios');
          return;
        }
        if (formData.password) {
          payload.password = formData.password;
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': bearerToken,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al guardar usuario');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg max-w-md w-full shadow-xl`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {user ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:border-blue-500'
              } outline-none`}
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Contraseña {user && '(dejar vacío para no cambiar)'}
            </label>
            <input
              type="password"
              required={!user}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:border-blue-500'
              } outline-none`}
              placeholder="Contraseña segura"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:border-blue-500'
              } outline-none`}
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-slate-900 placeholder-gray-400 focus:border-blue-500'
              } outline-none`}
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-blue-500'
                  : 'bg-white border-gray-300 text-slate-900 focus:border-blue-500'
              } outline-none`}
            >
              <option value="admin">Administrador</option>
              <option value="operator">Operador</option>
              <option value="driver">Conductor</option>
              <option value="support">Soporte</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
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
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
