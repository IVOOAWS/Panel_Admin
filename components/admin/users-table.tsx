'use client';

import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
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

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleColors = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  operator: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  driver: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  support: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const roleLabels = {
  admin: 'Administrador',
  operator: 'Operador',
  driver: 'Conductor',
  support: 'Soporte',
};

export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`overflow-x-auto rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'}`}>
      <table className="w-full text-sm">
        <thead className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'}`}>
          <tr>
            <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Usuario
            </th>
            <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Email
            </th>
            <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Rol
            </th>
            <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Teléfono
            </th>
            <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Estado
            </th>
            <th className={`px-6 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Último Login
            </th>
            <th className={`px-6 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-gray-200'}`}>
          {users.map(user => (
            <tr
              key={user.id}
              className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}`}
            >
              <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {user.full_name}
              </td>
              <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {user.email}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </td>
              <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                {user.phone || '-'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Activo
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Inactivo
                      </span>
                    </>
                  )}
                </div>
              </td>
              <td className={`px-6 py-4 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                {user.last_login ? formatDate(user.last_login) : 'Nunca'}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-blue-400 hover:bg-blue-900/30'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Editar usuario"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-red-400 hover:bg-red-900/30'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Eliminar usuario"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
