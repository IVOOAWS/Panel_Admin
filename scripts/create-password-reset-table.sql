-- Tabla para almacenar tokens de reset de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_id (user_id)
);

-- Tabla para log de intentos de reset
CREATE TABLE IF NOT EXISTS password_reset_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  email VARCHAR(255),
  action VARCHAR(50), -- 'request', 'success', 'failed', 'expired'
  status VARCHAR(20), -- 'pending', 'success', 'error'
  error_message TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
);

-- Agregar columna de verificación de email si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE AFTER email;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL AFTER email_verified;

-- Crear índice en email para búsquedas rápidas
ALTER TABLE users ADD UNIQUE INDEX IF NOT EXISTS idx_email_unique (email);
