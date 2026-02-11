-- Script SIMPLE para insertar usuario de prueba
-- Ejecuta este si el anterior da errores

INSERT IGNORE INTO users (email, password_hash, full_name, role, phone, is_active, created_at) 
VALUES 
  ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador', 'admin', '+1234567890', 1, NOW());

-- Si aún da error, ejecuta esto primero:
-- ALTER TABLE users ADD UNIQUE KEY unique_email (email);
-- Luego ejecuta este insert nuevamente
