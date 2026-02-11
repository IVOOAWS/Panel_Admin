# Tabla USERS - Sistema de Autenticación

## Descripción General

La tabla `users` es la tabla principal del sistema de autenticación. Contiene toda la información necesaria para que los usuarios hagan login, incluyendo credenciales, información de perfil y datos de auditoría.

---

## Estructura de la Tabla

### Campos Principales

| Campo | Tipo | Nulo | Clave | Descripción |
|-------|------|------|-------|-------------|
| id | INT | NO | PRIMARY KEY | ID único auto-incremento |
| email | VARCHAR(255) | NO | UNIQUE | Email único para login |
| password_hash | VARCHAR(255) | NO | - | Hash bcrypt de la contraseña |
| full_name | VARCHAR(255) | NO | - | Nombre completo del usuario |
| role | VARCHAR(50) | NO | - | Rol del usuario (admin, user, manager) |
| phone | VARCHAR(20) | SÍ | - | Teléfono de contacto (opcional) |
| is_active | BOOLEAN | NO | - | Si el usuario puede hacer login (TRUE/FALSE) |
| created_at | TIMESTAMP | NO | - | Fecha de creación (auto) |
| updated_at | TIMESTAMP | NO | - | Fecha de última actualización (auto) |
| last_login | TIMESTAMP | SÍ | - | Fecha del último login exitoso |

### Índices

```sql
INDEX idx_email (email)       -- Búsqueda rápida por email (login)
INDEX idx_role (role)         -- Búsqueda por rol
INDEX idx_is_active (is_active) -- Usuarios activos
INDEX idx_created_at (created_at) -- Ordenar por fecha
```

---

## Instalación

### Paso 1: Ejecutar el script SQL

```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/users-table.sql
```

### Paso 2: Verificar la instalación

```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "DESCRIBE users;"
```

Deberías ver la estructura completa de la tabla.

### Paso 3: Verificar datos de prueba

```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "SELECT id, email, full_name, role FROM users;"
```

Deberías ver al usuario admin@empresa.com.

---

## Campos en Detalle

### email
- **Tipo**: VARCHAR(255)
- **Restricción**: UNIQUE, NOT NULL
- **Descripción**: Email único usado para hacer login
- **Validación**: Debe ser un email válido (a@b.com)
- **Ejemplo**: admin@empresa.com

### password_hash
- **Tipo**: VARCHAR(255)
- **Descripción**: Hash bcrypt de la contraseña (NUNCA texto plano)
- **Longitud**: 60 caracteres (bcrypt estándar)
- **Ejemplo**: `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm`
- **Seguridad**: 
  - Usar bcrypt con cost 10
  - Nunca almacenar contraseña en texto plano
  - Cada contraseña debe ser hasheada individualmente

### full_name
- **Tipo**: VARCHAR(255)
- **Descripción**: Nombre completo del usuario
- **Validación**: No puede estar vacío
- **Ejemplo**: Administrador, Juan Pérez

### role
- **Tipo**: VARCHAR(50)
- **Descripción**: Rol del usuario para control de acceso
- **Valores permitidos**: 
  - `admin` - Acceso total al sistema
  - `user` - Usuario estándar
  - `manager` - Gestor de equipo
  - Extensible según necesidades
- **Ejemplo**: admin

### phone
- **Tipo**: VARCHAR(20)
- **Restricción**: Opcional (NULL permitido)
- **Descripción**: Teléfono de contacto
- **Validación**: Preferentemente en formato internacional
- **Ejemplo**: +1234567890

### is_active
- **Tipo**: BOOLEAN (0 o 1)
- **Descripción**: Si el usuario puede hacer login
- **Valores**: 
  - 1 o TRUE - Usuario activo (puede hacer login)
  - 0 o FALSE - Usuario desactivado (no puede hacer login)
- **Default**: TRUE
- **Uso**: Para suspender usuarios sin eliminarlos

### created_at
- **Tipo**: TIMESTAMP
- **Descripción**: Cuándo se creó el usuario
- **Auto**: Se establece automáticamente en NOW()
- **Modificable**: NO (nunca cambiar)
- **Uso**: Auditoría y registro histórico

### updated_at
- **Tipo**: TIMESTAMP
- **Descripción**: Cuándo se modificó el usuario por última vez
- **Auto**: Se actualiza automáticamente en cada cambio
- **Uso**: Saber cuándo fue el último cambio

### last_login
- **Tipo**: TIMESTAMP
- **Descripción**: Cuándo fue el último login exitoso
- **Default**: NULL
- **Actualización**: Después de cada login exitoso
- **Uso**: Auditoría y análisis de actividad

---

## Queries Comunes

### 1. Login de Usuario

```sql
-- Buscar usuario por email
SELECT id, email, password_hash, full_name, role, is_active 
FROM users 
WHERE email = 'admin@empresa.com' AND is_active = TRUE;
```

### 2. Crear Nuevo Usuario

```sql
-- Hash de contraseña debe ser generado en aplicación con bcrypt
INSERT INTO users (email, password_hash, full_name, role, phone) 
VALUES ('usuario@empresa.com', '$2b$10$...', 'Nombre Usuario', 'user', '+1234567890');
```

### 3. Actualizar Último Login

```sql
-- Ejecutar después de login exitoso
UPDATE users 
SET last_login = NOW() 
WHERE id = 1;
```

### 4. Cambiar Contraseña

```sql
-- Hash debe ser generado en aplicación
UPDATE users 
SET password_hash = '$2b$10$...' 
WHERE id = 1;
```

### 5. Desactivar Usuario

```sql
-- Suspender sin eliminar
UPDATE users 
SET is_active = FALSE 
WHERE id = 2;
```

### 6. Reactivar Usuario

```sql
-- Reactivar usuario
UPDATE users 
SET is_active = TRUE 
WHERE id = 2;
```

### 7. Listar Usuarios Activos

```sql
SELECT id, email, full_name, role, created_at 
FROM users 
WHERE is_active = TRUE 
ORDER BY created_at DESC;
```

### 8. Listar Administradores

```sql
SELECT id, email, full_name, last_login 
FROM users 
WHERE role = 'admin' AND is_active = TRUE;
```

### 9. Contar Usuarios

```sql
SELECT COUNT(*) as total_usuarios 
FROM users;
```

### 10. Usuarios sin Login

```sql
-- Usuarios que nunca han hecho login
SELECT id, email, full_name, created_at 
FROM users 
WHERE last_login IS NULL 
ORDER BY created_at DESC;
```

---

## Seguridad

### Contraseñas

1. **NUNCA** almacenar contraseñas en texto plano
2. **SIEMPRE** usar bcrypt con cost 10 mínimo
3. Verificar contraseña comparando hash en aplicación
4. Hash debe tener 60 caracteres (bcrypt estándar)

### Email

1. Campo UNIQUE para evitar duplicados
2. Validar formato email en aplicación
3. No permitir cambios de email sin verificación

### is_active

1. Usar para suspender sin eliminar registros
2. Verificar en cada login
3. Mantener auditoría de cambios

### Auditoría

1. created_at - Nunca modificar
2. updated_at - Automático
3. last_login - Actualizar en cada login
4. Mantener logs de cambios importantes

---

## Datos de Prueba

### Usuario Admin Predefinido

```
Email: admin@empresa.com
Contraseña: admin123
Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm
Rol: admin
Activo: Sí
```

---

## Mantenimiento

### Limpiar Registros Inactivos

```sql
-- Ver usuarios desactivados hace más de 1 año
SELECT id, email, full_name, updated_at 
FROM users 
WHERE is_active = FALSE 
AND updated_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### Estadísticas

```sql
-- Ver actividad por fecha
SELECT DATE(created_at) as fecha, COUNT(*) as nuevos_usuarios 
FROM users 
GROUP BY DATE(created_at) 
ORDER BY fecha DESC;
```

### Auditoría de Logins

```sql
-- Usuarios más activos (últimos logins)
SELECT email, full_name, last_login 
FROM users 
WHERE is_active = TRUE 
ORDER BY last_login DESC 
LIMIT 10;
```

---

## Notas Importantes

1. **Charset UTF-8**: La tabla usa `utf8mb4` para soportar caracteres especiales
2. **InnoDB**: Motor de base de datos con soporte para transacciones
3. **Auto-increment**: El ID se genera automáticamente
4. **Timestamps**: Automáticos y en zona horaria del servidor

---

## Próximos Pasos

1. ✅ Crear tabla con `scripts/users-table.sql`
2. ✅ Insertar usuario admin
3. Probar login en aplicación
4. Crear nuevos usuarios desde UI
5. Implementar gestión de usuarios en admin
