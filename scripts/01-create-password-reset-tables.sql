-- Crear tabla para password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
);

-- Crear tabla para logs de password reset
CREATE TABLE IF NOT EXISTS password_reset_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  email VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  error_message TEXT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
