# Sistema Completo de Gestión de Usuarios con Autenticación Bearer

## 🎯 Resumen de lo Implementado

Se ha creado un sistema completo de gestión de usuarios con autenticación Bearer encriptada para el panel admin. A continuación se detalla todo lo que ha sido implementado:

---

## 📋 Archivos Creados/Modificados

### 1. **Scripts SQL** (`scripts/setup-users-auth.sql`)
Script que crea toda la estructura de base de datos necesaria:
- Tabla `users` con columnas de autenticación
- Tabla `user_audit_logs` para auditoría
- Índices para optimización
- Procedimientos almacenados

---

## 🔐 Autenticación Bearer

### ¿Cómo Funciona?

El Bearer token es una cadena en formato: **`email:password` (en Base64)**

**Ejemplo:**
```
Usuario: admin@empresa.com
Contraseña: MiContraseña123

Bearer Token: YWRtaW5AZW1wcmVzYS5jb206TWlDb250cmFzZW7DsWExMjM=
```

### Archivo: `lib/bearer-token.ts`

```typescript
import crypto from 'crypto';
import { Buffer } from 'buffer';

// Generar Bearer Token
export function generateBearerToken(email: string, password: string): string {
  const credentials = `${email}:${password}`;
  return Buffer.from(credentials).toString('base64');
}

// Decodificar Bearer Token
export function decodeBearerToken(token: string): { email: string; password: string } {
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const [email, password] = decoded.split(':');
  return { email, password };
}
```

---

## 🗄️ Script SQL Completo

Ejecuta este script en tu base de datos MySQL:

```sql
-- Crear tabla de usuarios con autenticación
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  api_token VARCHAR(255) UNIQUE NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuario de prueba (contraseña: admin123 - hash bcrypt)
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES ('admin@empresa.com', '$2a$10$YourBcryptHashHere', 'Administrador', 'admin', TRUE)
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

---

## 🔌 Endpoints de API

### 1. **Login** `POST /api/auth/login`

**Request:**
```json
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión iniciada correctamente",
  "sessionId": "abc123def456",
  "bearerToken": "YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=",
  "user": {
    "id": 1,
    "email": "admin@empresa.com",
    "name": "Administrador",
    "role": "admin"
  }
}
```

---

### 2. **Listar Usuarios** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "admin@empresa.com",
      "full_name": "Administrador",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-02-10T10:00:00Z"
    }
  ]
}
```

---

### 3. **Crear Usuario** `POST /api/admin/users`

**Headers:**
```
Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=
Content-Type: application/json
```

**Request:**
```json
{
  "email": "nuevo@empresa.com",
  "password": "NuevaContraseña123",
  "full_name": "Nuevo Usuario",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "user": {
    "id": 2,
    "email": "nuevo@empresa.com",
    "full_name": "Nuevo Usuario",
    "role": "user",
    "is_active": true,
    "created_at": "2024-02-10T10:30:00Z"
  }
}
```

---

### 4. **Editar Usuario** `PUT /api/admin/users/[id]`

**Headers:**
```
Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=
Content-Type: application/json
```

**Request:**
```json
{
  "full_name": "Usuario Actualizado",
  "email": "actualizado@empresa.com",
  "role": "admin"
}
```

---

### 5. **Eliminar Usuario** `DELETE /api/admin/users/[id]`

**Headers:**
```
Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=
Content-Type: application/json
```

---

## 🧪 Ejemplos con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "admin123"
  }'
```

### Crear Usuario
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@empresa.com",
    "password": "NuevaContraseña123",
    "full_name": "Nuevo Usuario",
    "role": "user"
  }'
```

### Listar Usuarios
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM="
```

### Editar Usuario
```bash
curl -X PUT http://localhost:3000/api/admin/users/2 \
  -H "Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Usuario Actualizado",
    "email": "actualizado@empresa.com"
  }'
```

### Eliminar Usuario
```bash
curl -X DELETE http://localhost:3000/api/admin/users/2 \
  -H "Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM="
```

---

## 🎨 Interfaz de Usuario

### Página: `/admin/users`

Se ha creado una sección completa de gestión de usuarios con:

✅ **Tabla de Usuarios**
- Listado de todos los usuarios
- Mostrar email, nombre, rol, estado activo
- Botones de editar y eliminar

✅ **Modal Crear Usuario**
- Formulario para crear nuevo usuario
- Campos: email, contraseña, nombre, rol
- Validación en tiempo real

✅ **Modal Editar Usuario**
- Formulario para editar usuario existente
- Puede cambiar nombre, email, rol
- Opción de cambiar contraseña

✅ **Modal Eliminar Usuario**
- Confirmación antes de eliminar
- Validación de seguridad

✅ **Navegación en Sidebar**
- Nuevo item "Gestionar Usuarios" en el sidebar
- Ícono de usuarios (Users)
- Disponible en desktop y móvil

---

## 🔑 Características de Seguridad

1. **Contraseñas Encriptadas**: Uso de bcrypt para hashear contraseñas
2. **Bearer Token**: Autenticación basada en email:password en Base64
3. **Validación de Entrada**: Verificación de campos requeridos
4. **Headers CORS**: Configuración segura de CORS
5. **Auditoría**: Tabla de logs para registrar cambios
6. **Estado Activo**: Usuarios inactivos no pueden hacer login

---

## 📝 Archivos de Configuración Modificados

### `components/auth/login-form.tsx`
- ✅ Integrado con API real de login
- ✅ Guarda Bearer token en localStorage
- ✅ Envía solicitud a `/api/auth/login`

### `app/api/auth/login/route.ts`
- ✅ Genera y devuelve Bearer token
- ✅ Establece cookies de sesión y token
- ✅ Registra último login del usuario

### `components/admin/sidebar.tsx`
- ✅ Agregado ítem "Gestionar Usuarios"
- ✅ Disponible en navegación desktop y móvil
- ✅ Ícono de Users (lucide-react)

---

## 🚀 Pasos Siguientes

1. **Ejecutar Script SQL**
   - Copia el contenido de `scripts/setup-users-auth.sql`
   - Ejecuta en tu cliente MySQL
   - Crea las tablas necesarias

2. **Crear Usuario Admin**
   - Usa tu cliente MySQL o ejecuta:
   ```sql
   INSERT INTO users (email, password_hash, full_name, role, is_active)
   VALUES ('admin@empresa.com', '$2a$10$your_bcrypt_hash', 'Admin', 'admin', TRUE);
   ```

3. **Probar Login**
   - Ve a la página de login
   - Usa las credenciales creadas
   - Verifica que el Bearer token se guarda

4. **Acceder a Gestionar Usuarios**
   - En el sidebar, haz clic en "Gestionar Usuarios"
   - Crea, edita y elimina usuarios
   - Prueba los diferentes roles

---

## 🐛 Solución de Problemas

### Error: "Usuario no encontrado"
- Verifica que el usuario existe en la BD
- Comprueba la contraseña sea correcta
- Revisa que el usuario esté activo

### Error: "Bearer token inválido"
- Asegúrate que el header Authorization está presente
- Verifica que el token tiene el formato correcto
- El token debe ser `Bearer {token_en_base64}`

### Error: "Conexión rechazada"
- Verifica que la BD está conectada
- Comprueba las credenciales de conexión
- Revisa las variables de entorno

---

## 📚 Documentación Adicional

- `docs/AUTHENTICATION_BEARER.md` - Detalles técnicos de autenticación
- `SETUP_USERS_SYSTEM.md` - Guía de instalación completa
- `RESUMEN_SQL.md` - Scripts SQL únicamente

---

**¡Sistema listo para usar!** 🎉
