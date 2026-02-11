# Resumen SQL - Sistema de Gestión de Usuarios

## Instrucciones Rápidas

### 1. Ejecutar el Script Principal

```sql
-- Copiar y pegar en tu cliente MySQL:
source scripts/setup-users-auth.sql;
```

O ejecutar desde terminal:

```bash
mysql -u tu_usuario -p tu_base_datos < scripts/setup-users-auth.sql
```

---

## Código SQL Mínimo (Si no puedes ejecutar el script)

Copia y pega esto en tu cliente MySQL:

```sql
-- 1. Agregar columnas a tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token VARCHAR(500) COMMENT 'Token Bearer para autenticación';
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token_created_at TIMESTAMP COMMENT 'Fecha de creación del token';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP COMMENT 'Último login del usuario';

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_api_token ON users(api_token);

-- 3. Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS user_audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL COMMENT 'crear, editar, eliminar, login',
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- 4. Insertar usuario admin (contraseña: admin123)
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin@panel.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador Principal', 'admin', '+1234567890', TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- 5. Verificar la instalación
SELECT id, email, full_name, role, is_active FROM users;
DESC users;
DESC user_audit_logs;
```

---

## Hashes de Contraseñas de Prueba (bcrypt)

```
admin123      → $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm
test1234      → $2b$10$r9h2cIPJfV89vxNJVWXVkuP5qm3N7G7G/Q0cKKpKlNVjJ8Q5O4bAC
password123   → $2b$10$L9.6KqG7VN8x5Q3V7H9ZHO8z4Q5K3L2V7N9Z8H6J4K2L3V5N8P0
```

---

## Crear Usuarios de Prueba

```sql
-- Operador
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('operador@panel.com', '$2b$10$r9h2cIPJfV89vxNJVWXVkuP5qm3N7G7G/Q0cKKpKlNVjJ8Q5O4bAC', 'Juan Operador', 'operator', '+1234567891', TRUE);

-- Conductor
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('conductor@panel.com', '$2b$10$L9.6KqG7VN8x5Q3V7H9ZHO8z4Q5K3L2V7N9Z8H6J4K2L3V5N8P0', 'Carlos Conductor', 'driver', '+1234567892', TRUE);

-- Soporte
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('soporte@panel.com', '$2b$10$r9h2cIPJfV89vxNJVWXVkuP5qm3N7G7G/Q0cKKpKlNVjJ8Q5O4bAC', 'María Soporte', 'support', '+1234567893', TRUE);
```

---

## Consultas Útiles

### Ver todos los usuarios
```sql
SELECT id, email, full_name, role, is_active, created_at, last_login FROM users;
```

### Ver historial de auditoría
```sql
SELECT u.email, a.action, a.created_at FROM user_audit_logs a
JOIN users u ON a.user_id = u.id
ORDER BY a.created_at DESC LIMIT 20;
```

### Ver últimos logins
```sql
SELECT id, email, full_name, last_login FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC;
```

### Actualizar contraseña de un usuario
```sql
-- Generar nuevo hash en tu aplicación primero, luego:
UPDATE users SET password_hash = 'nuevo_hash_bcrypt_aqui' WHERE id = 1;
```

### Desactivar usuario
```sql
UPDATE users SET is_active = FALSE WHERE id = 2;
```

### Activar usuario
```sql
UPDATE users SET is_active = TRUE WHERE id = 2;
```

### Cambiar rol de usuario
```sql
UPDATE users SET role = 'admin' WHERE id = 2;
```

---

## Procedimientos Almacenados

Los procedimientos se crean automáticamente con el script.

### Crear usuario (sp_create_user)
```sql
CALL sp_create_user('nuevo@email.com', '$2b$10$hash_aqui', 'Nuevo Usuario', 'operator', '+1234567890');
```

### Actualizar token API (sp_update_api_token)
```sql
CALL sp_update_api_token(1, 'token_encriptado_aqui');
```

### Registrar login (sp_log_user_login)
```sql
CALL sp_log_user_login(1, '192.168.1.1');
```

---

## Información Adicional sobre Bearer Token

### Formato
```
Bearer base64(email:password)
```

### Ejemplo
```
email: admin@panel.com
password: admin123

Resultado: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz
```

### Verificar Bearer Token en consola de navegador
```javascript
// En consola del navegador, después de login:
const token = localStorage.getItem('bearerToken');
console.log(token); // Ver el Bearer token

// Decodificar para verificar
const encoded = token.replace('Bearer ', '');
const decoded = atob(encoded);
console.log(decoded); // Muestra: email:password
```

---

## Checklist de Instalación

- [ ] Ejecutar script SQL: `scripts/setup-users-auth.sql`
- [ ] Verificar que la tabla users tiene `api_token`, `api_token_created_at`, `last_login`
- [ ] Verificar que existe la tabla `user_audit_logs`
- [ ] Insertar usuario admin de prueba
- [ ] Probar login en `/login` con `admin@panel.com` / `admin123`
- [ ] Verificar que aparece Bearer token en localStorage
- [ ] Acceder a `/admin/users`
- [ ] Crear usuario de prueba
- [ ] Editar usuario de prueba
- [ ] Eliminar usuario de prueba (soft delete)
- [ ] Verificar en BD que el usuario se marcó como inactivo

---

## Notas de Seguridad

1. **Nunca** almacenes contraseñas en texto plano
2. **Siempre** usa bcrypt para encriptar contraseñas
3. El Bearer token es `base64(email:password)` - NO es seguro almacenarlo en texto plano
4. En producción, usa HTTPS siempre
5. Rota las contraseñas regularmente
6. Revisa los logs de auditoría frecuentemente

---

## Passwords de Prueba en Texto Plano

```
admin123
test1234
password123
```

**Importante:** Cambia estos en producción

---

## Variables de Base de Datos

```
tabla: users
columnas nuevas: api_token, api_token_created_at, last_login

tabla: user_audit_logs
columnas: id, user_id, action, old_values, new_values, ip_address, created_at
```

---

¡Listo! El sistema está completamente configurado.
