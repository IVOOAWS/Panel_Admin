-- ========================================
-- TABLA USERS - SISTEMA DE AUTENTICACIÓN
-- ========================================
-- Script completo para crear la tabla users
-- con toda la información necesaria para login
-- ========================================

-- Crear tabla users
CREATE TABLE IF NOT EXISTS users (
  -- Campos principales
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID único del usuario',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email único para login',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt de la contraseña',
  full_name VARCHAR(255) NOT NULL COMMENT 'Nombre completo del usuario',
  
  -- Información de rol y permisos
  role VARCHAR(50) NOT NULL DEFAULT 'user' COMMENT 'Rol del usuario: admin, user, manager, etc',
  
  -- Información de contacto
  phone VARCHAR(20) COMMENT 'Teléfono del usuario',
  
  -- Estado del usuario
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Si el usuario está activo o no',
  
  -- Auditoría y trazabilidad
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  last_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Fecha del último login exitoso',
  
  -- Índices para optimización de búsquedas
  INDEX idx_email (email) COMMENT 'Índice para búsqueda rápida por email',
  INDEX idx_role (role) COMMENT 'Índice para búsqueda por rol',
  INDEX idx_is_active (is_active) COMMENT 'Índice para usuarios activos',
  INDEX idx_created_at (created_at) COMMENT 'Índice por fecha de creación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de usuarios del sistema de autenticación';

-- ========================================
-- INSERCIONES DE EJEMPLO
-- ========================================

-- Usuario admin de prueba
-- Email: admin@empresa.com
-- Contraseña: admin123
-- Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES 
  ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador', 'admin', '+1234567890', 1);

-- ========================================
-- INFORMACIÓN DE LA TABLA
-- ========================================

-- Estructura de campos:
-- - id: Identificador único (Auto-incremento)
-- - email: Email único para login
-- - password_hash: Hash bcrypt de la contraseña (nunca almacenar en texto plano)
-- - full_name: Nombre completo del usuario
-- - role: Rol para control de acceso (admin, user, manager, etc)
-- - phone: Teléfono de contacto
-- - is_active: Estado activo/inactivo del usuario
-- - created_at: Cuándo se creó el usuario
-- - updated_at: Cuándo se modificó por última vez
-- - last_login: Cuándo fue el último login

-- ========================================
-- QUERIES ÚTILES
-- ========================================

-- Ver estructura de la tabla:
-- DESCRIBE users;

-- Ver todos los usuarios:
-- SELECT id, email, full_name, role, is_active, created_at FROM users;

-- Buscar usuario por email (para login):
-- SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = 'admin@empresa.com';

-- Actualizar último login:
-- UPDATE users SET last_login = NOW() WHERE id = 1;

-- Contar usuarios activos:
-- SELECT COUNT(*) as usuarios_activos FROM users WHERE is_active = TRUE;

-- Ver usuarios por rol:
-- SELECT email, full_name, role FROM users WHERE role = 'admin';

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================

-- 1. CONTRASEÑAS:
--    - Siempre usar bcrypt para hash de contraseñas
--    - Nunca almacenar contraseñas en texto plano
--    - Hash debe tener longitud de 60 caracteres (bcrypt)

-- 2. EMAIL:
--    - Campo UNIQUE para evitar duplicados
--    - Obligatorio para login
--    - Se recomienda agregar validación en aplicación

-- 3. ROLES:
--    - admin: Acceso total al sistema
--    - user: Usuario estándar con permisos limitados
--    - manager: Usuario con permisos de gestión
--    - Puede ser extendido según necesidades

-- 4. is_active:
--    - TRUE: Usuario activo y puede hacer login
--    - FALSE: Usuario desactivado (no puede hacer login)

-- 5. AUDITORÍA:
--    - created_at: Automático, nunca cambiar
--    - updated_at: Automático, se actualiza en cada cambio
--    - last_login: Actualizar cada login exitoso

-- 6. ÍNDICES:
--    - email: Optimiza búsquedas de login
--    - role: Para queries de usuarios por rol
--    - is_active: Para listar usuarios activos
--    - created_at: Para ordenar por fecha
