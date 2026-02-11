# Autenticación Bearer y Gestión de Usuarios

## Descripción General

Este documento describe el sistema de autenticación Bearer implementado en el Panel Admin. El sistema utiliza tokens Bearer basados en credenciales encriptadas (email:password) para autenticar llamadas a la API.

---

## Estructura de la Base de Datos

### Tabla: `users`

```sql
-- Campos principales para autenticación
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Contraseña encriptada con bcrypt
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'driver', 'support') DEFAULT 'operator',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  api_token VARCHAR(500),              -- Token Bearer encriptado (opcional)
  api_token_created_at TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_api_token (api_token)
);
```

### Tabla: `user_audit_logs` (Auditoría)

```sql
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,        -- 'crear', 'editar', 'eliminar', 'login'
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action)
);
```

---

## Instalación y Configuración

### 1. Ejecutar Script SQL

```sql
-- En tu cliente MySQL, ejecuta:
source /path/to/scripts/setup-users-auth.sql
```

O manualmente:

```sql
-- Agregar columnas a la tabla users existente
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token_created_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action)
);
```

### 2. Crear Usuario Admin Inicial

```sql
INSERT INTO users (
  email, 
  password_hash, 
  full_name, 
  role, 
  is_active
) VALUES (
  'admin@panel.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', -- contraseña: admin123
  'Administrador Principal',
  'admin',
  TRUE
);
```

---

## Generación de Bearer Token

### Formato del Bearer Token

```
Bearer base64(email:password)
```

**Ejemplo:**
```
Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
```

Cuando se decodifica: `admin@panel.com:admin123`

### Generar Token (desde JavaScript)

```javascript
function generateBearerToken(email, password) {
  const credentials = `${email}:${password}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Bearer ${encoded}`;
}

// Uso
const token = generateBearerToken('admin@panel.com', 'admin123');
console.log(token); // Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
```

---

## API Endpoints

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@panel.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "sessionId": "session_id_12345",
  "bearerToken": "Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz",
  "user": {
    "id": 1,
    "email": "admin@panel.com",
    "name": "Administrador Principal",
    "role": "admin"
  }
}
```

---

### 2. Listar Usuarios

**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@panel.com",
      "full_name": "Administrador Principal",
      "role": "admin",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "last_login": "2024-01-20T14:45:00Z"
    }
  ],
  "count": 1
}
```

---

### 3. Crear Usuario

**Endpoint:** `POST /api/admin/users`

**Headers:**
```
Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
Content-Type: application/json
```

**Request:**
```json
{
  "email": "operador@panel.com",
  "password": "SeguraPass123!",
  "full_name": "Juan Operador",
  "role": "operator",
  "phone": "+1234567891"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 2,
    "email": "operador@panel.com",
    "full_name": "Juan Operador",
    "role": "operator",
    "phone": "+1234567891"
  }
}
```

---

### 4. Obtener Usuario por ID

**Endpoint:** `GET /api/admin/users/[id]`

**Headers:**
```
Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "operador@panel.com",
    "full_name": "Juan Operador",
    "role": "operator",
    "phone": "+1234567891",
    "is_active": true,
    "created_at": "2024-01-20T10:30:00Z",
    "last_login": "2024-01-20T14:45:00Z"
  }
}
```

---

### 5. Editar Usuario

**Endpoint:** `PUT /api/admin/users/[id]`

**Headers:**
```
Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
Content-Type: application/json
```

**Request:**
```json
{
  "email": "operador@panel.com",
  "full_name": "Juan Operador Actualizado",
  "role": "operator",
  "phone": "+1234567892",
  "password": "NuevaPassword123!",  // Opcional
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente"
}
```

---

### 6. Eliminar Usuario (Soft Delete)

**Endpoint:** `DELETE /api/admin/users/[id]`

**Headers:**
```
Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Solicitud inválida (faltan campos requeridos) |
| 401 | No autenticado (Bearer token faltante o inválido) |
| 403 | No autorizado (usuario no es admin) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (email duplicado) |
| 500 | Error del servidor |

---

## Ejemplo de Uso en Cliente

### Usando Fetch API

```javascript
// 1. Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include'
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('bearerToken', data.bearerToken);
    return data;
  } else {
    throw new Error(data.message);
  }
}

// 2. Listar usuarios
async function listUsers() {
  const token = localStorage.getItem('bearerToken');
  
  const response = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}

// 3. Crear usuario
async function createUser(userData) {
  const token = localStorage.getItem('bearerToken');
  
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
}

// 4. Editar usuario
async function updateUser(userId, userData) {
  const token = localStorage.getItem('bearerToken');
  
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
}

// 5. Eliminar usuario
async function deleteUser(userId) {
  const token = localStorage.getItem('bearerToken');
  
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}
```

---

## Mejores Prácticas de Seguridad

1. **Contraseñas:** Siempre se encriptan con bcrypt (10 rounds)
2. **Bearer Token:** Solo transmitir por HTTPS en producción
3. **Almacenamiento:** Guardar Bearer token en localStorage o httpOnly cookies
4. **Validación:** Validar Bearer token en cada request
5. **Auditoría:** Registrar todas las acciones de usuarios
6. **Rate Limiting:** Implementar límite de intentos de login
7. **Sessions:** Las sesiones expiran después de 24 horas

---

## Roles y Permisos

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | Acceso total a todas las secciones |
| `operator` | Operador | Gestión de órdenes y tiendas |
| `driver` | Conductor | Vista de entregas asignadas |
| `support` | Soporte | Gestión de tickets y reportes |

---

## Troubleshooting

### Bearer Token inválido
- Verificar que el formato sea `Bearer base64(email:password)`
- Asegurar que las credenciales sean correctas
- Revisar que el usuario esté activo

### Usuario no encontrado
- Verificar el email en la base de datos
- Confirmar que el usuario no ha sido eliminado (soft delete)

### Acceso denegado (403)
- Confirmar que el usuario es administrador
- Solo los admins pueden listar/crear/editar usuarios

---

## Documentación Adicional

- Ver `/app/admin/users/page.tsx` para la interfaz de gestión
- Ver `/lib/bearer-token.ts` para utilidades de tokens
- Ver `/app/api/auth/login/route.ts` para autenticación
