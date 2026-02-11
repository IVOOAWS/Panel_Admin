-- Script para insertar usuario de prueba
-- Contraseña: admin123 (bcrypt hash)
-- Email: admin@empresa.com

-- Primero verificar si el usuario ya existe
DELETE FROM users WHERE email = 'admin@empresa.com';

-- Insertar usuario admin de prueba
-- Hash de "admin123" usando bcrypt
-- Hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm
INSERT INTO users (email, password_hash, full_name, role, phone, is_active, created_at, last_login) 
VALUES 
  ('admin@empresa.com', 
   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 
   'Administrador', 
   'admin', 
   '+1234567890', 
   1, 
   NOW(),
   NULL);

-- Verificar que el usuario fue creado
SELECT 'Usuario de prueba creado:' as mensaje;
SELECT id, email, full_name, role, is_active, created_at FROM users WHERE email = 'admin@empresa.com';

-- Instrucciones para login
SELECT 'Para login usa:' as instruccion;
SELECT 'Email: admin@empresa.com' as credencial;
SELECT 'Contraseña: admin123' as credencial;
