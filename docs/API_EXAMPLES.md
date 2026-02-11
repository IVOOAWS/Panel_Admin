# Ejemplos de Integración API - Gestión de Usuarios

## 🚀 Quick Start

### 1. Login y Obtener Bearer Token

```typescript
// components/auth/login-form.tsx (ya implementado)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: username, 
      password 
    }),
    credentials: 'include', // Para cookies
  });

  const data = await response.json();
  
  if (response.ok) {
    // Guardar Bearer token
    localStorage.setItem('bearerToken', data.bearerToken);
    // Guardar info del usuario
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirigir
    router.push('/admin/dashboard');
  }
};
```

---

## 👥 Gestión de Usuarios

### 2. Obtener Bearer Token del Cliente

```typescript
// utils/auth-client.ts
export function getBearerToken(): string | null {
  return localStorage.getItem('bearerToken');
}

export function clearAuth() {
  localStorage.removeItem('bearerToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
}

export function getHeaders(): HeadersInit {
  const token = getBearerToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}
```

### 3. Hook para Listar Usuarios

```typescript
// hooks/use-users.ts
import { useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('bearerToken');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
}
```

---

### 4. Crear Usuario

```typescript
// hooks/use-create-user.ts
import { useState } from 'react';

export function useCreateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (userData: {
    email: string;
    password: string;
    full_name: string;
    role: 'admin' | 'user';
  }) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('bearerToken');
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating user');
      }

      const data = await response.json();
      return data.user;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
}
```

---

### 5. Editar Usuario

```typescript
// hooks/use-update-user.ts
import { useState } from 'react';

export function useUpdateUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (
    userId: number,
    updates: {
      full_name?: string;
      email?: string;
      role?: 'admin' | 'user';
      password?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('bearerToken');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating user');
      }

      const data = await response.json();
      return data.user;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateUser, loading, error };
}
```

---

### 6. Eliminar Usuario

```typescript
// hooks/use-delete-user.ts
import { useState } from 'react';

export function useDeleteUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('bearerToken');
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error deleting user');
      }

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
}
```

---

## 🔌 Servicio API Centralizado

```typescript
// services/api-client.ts
class ApiClient {
  private baseUrl = '/api';

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('bearerToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado o inválido
        localStorage.clear();
        window.location.href = '/login';
      }

      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Métodos de usuarios
  async getUsers() {
    return this.request('/admin/users');
  }

  async createUser(userData: any) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, updates: any) {
    return this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: number) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    localStorage.clear();
  }
}

export const apiClient = new ApiClient();
```

---

## 🧩 Componente de Ejemplo Completo

```typescript
// components/admin/users-management.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/use-users';
import { useCreateUser } from '@/hooks/use-create-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import { useDeleteUser } from '@/hooks/use-delete-user';

export function UsersManagement() {
  const { users, loading: usersLoading, refetch } = useUsers();
  const { createUser, loading: createLoading } = useCreateUser();
  const { updateUser, loading: updateLoading } = useUpdateUser();
  const { deleteUser, loading: deleteLoading } = useDeleteUser();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleCreate = async (formData: any) => {
    try {
      await createUser(formData);
      setShowCreateModal(false);
      await refetch();
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdate = async (formData: any) => {
    try {
      await updateUser(editingUser.id, formData);
      setEditingUser(null);
      await refetch();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      await refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (usersLoading) return <div>Cargando usuarios...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1>Gestión de Usuarios</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={createLoading}
        >
          {createLoading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.full_name}</td>
              <td>{user.role}</td>
              <td>{user.is_active ? 'Sí' : 'No'}</td>
              <td>
                <button
                  onClick={() => setEditingUser(user)}
                  disabled={updateLoading}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  disabled={deleteLoading}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modales de crear/editar */}
    </div>
  );
}
```

---

## 🧪 Testing con Jest

```typescript
// __tests__/users-api.test.ts
import { apiClient } from '@/services/api-client';

describe('Users API', () => {
  beforeEach(() => {
    localStorage.setItem('bearerToken', 'test_token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('should fetch users with bearer token', async () => {
    const mockResponse = {
      success: true,
      users: [
        {
          id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user',
        },
      ],
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    ) as jest.Mock;

    const result = await apiClient.getUsers();
    
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/users',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test_token',
        }),
      })
    );
  });
});
```

---

## 📚 Resumen de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login y obtener Bearer token |
| GET | `/api/admin/users` | Listar todos los usuarios |
| POST | `/api/admin/users` | Crear nuevo usuario |
| PUT | `/api/admin/users/[id]` | Editar usuario |
| DELETE | `/api/admin/users/[id]` | Eliminar usuario |

---

**¡Listos para integrar!** 🎯
