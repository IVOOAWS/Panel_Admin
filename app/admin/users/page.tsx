'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import UsersTable from '@/components/admin/users-table';
import UserFormModal from '@/components/admin/user-form-modal';
import DeleteUserModal from '@/components/admin/delete-user-modal';
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

export default function UsersPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const bearerToken = localStorage.getItem('bearerToken');

      if (!bearerToken) {
        setError('No hay autenticación. Por favor inicia sesión.');
        return;
      }

      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': bearerToken,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar los usuarios');
      }

      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando usuarios');
      console.error('[v0] Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCreateUser() {
    setEditingUser(null);
    setShowFormModal(true);
  }

  function handleEditUser(user: User) {
    setEditingUser(user);
    setShowFormModal(true);
  }

  function handleDeleteClick(user: User) {
    setUserToDelete(user);
    setShowDeleteModal(true);
  }

  async function handleDeleteConfirm() {
    if (!userToDelete) return;

    try {
      const bearerToken = localStorage.getItem('bearerToken');
      if (!bearerToken) {
        setError('No hay autenticación');
        return;
      }

      const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': bearerToken,
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo eliminar el usuario');
      }

      setUsers(users.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando usuario');
    }
  }

  // Filtrar usuarios
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className={`flex-1 flex flex-col h-full ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`border-b ${isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'} p-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Gestionar Usuarios
                </h1>
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                Crear, editar y gestionar usuarios del sistema
              </p>
            </div>

            <button
              onClick={handleCreateUser}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className={`relative ${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <Search className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-gray-400'} rounded-lg outline-none transition-colors`}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Users Table */}
          {loading ? (
            <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Cargando usuarios...
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className={`text-center py-12 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              No hay usuarios
            </div>
          ) : (
            <>
              <UsersTable
                users={paginatedUsers}
                onEdit={handleEditUser}
                onDelete={handleDeleteClick}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? isDark ? 'text-slate-600 bg-slate-800' : 'text-gray-400 bg-gray-100'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          page === currentPage
                            ? 'bg-green-600 text-white'
                            : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? isDark ? 'text-slate-600 bg-slate-800' : 'text-gray-400 bg-gray-100'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={() => {
          fetchUsers();
          setShowFormModal(false);
          setEditingUser(null);
        }}
      />

      <DeleteUserModal
        isOpen={showDeleteModal}
        user={userToDelete}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
