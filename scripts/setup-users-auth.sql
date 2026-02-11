-- Script para mejorar tabla de usuarios con autenticación Bearer
-- Ejecutar este script en tu base de datos MySQL

-- Verificar si la columna api_token ya existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token VARCHAR(500) COMMENT 'Token Bearer para autenticación';
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_token_created_at TIMESTAMP COMMENT 'Fecha de creación del token';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP COMMENT 'Último login del usuario';

-- Crear índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_api_token ON users(api_token);

-- Crear tabla de auditoría para los usuarios (opcional pero recomendado)
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

-- Inserts iniciales (si no existen)
-- Contraseña encriptada para: admin123 (bcrypt)
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES 
  ('admin@panel.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador Principal', 'admin', '+1234567890', TRUE)
ON DUPLICATE KEY UPDATE email = email;

-- Crear vista para usuarios activos
CREATE OR REPLACE VIEW active_users AS
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  created_at,
  last_login
FROM users 
WHERE is_active = TRUE;

-- Procedimiento para crear un usuario (opcional)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_create_user(
  IN p_email VARCHAR(255),
  IN p_password_hash VARCHAR(255),
  IN p_full_name VARCHAR(255),
  IN p_role ENUM('admin', 'operator', 'driver', 'support'),
  IN p_phone VARCHAR(20)
)
BEGIN
  INSERT INTO users (email, password_hash, full_name, role, phone, is_active)
  VALUES (p_email, p_password_hash, p_full_name, p_role, p_phone, TRUE);
  
  SELECT LAST_INSERT_ID() as user_id;
END//
DELIMITER ;

-- Procedimiento para actualizar token de API
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_update_api_token(
  IN p_user_id INT,
  IN p_api_token VARCHAR(500)
)
BEGIN
  UPDATE users 
  SET api_token = p_api_token,
      api_token_created_at = NOW()
  WHERE id = p_user_id;
END//
DELIMITER ;

-- Procedimiento para registrar login
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_log_user_login(
  IN p_user_id INT,
  IN p_ip_address VARCHAR(45)
)
BEGIN
  UPDATE users 
  SET last_login = NOW()
  WHERE id = p_user_id;
  
  INSERT INTO user_audit_logs (user_id, action, ip_address)
  VALUES (p_user_id, 'login', p_ip_address);
END//
DELIMITER ;
