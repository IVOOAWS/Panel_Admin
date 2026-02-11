import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paneldelivery',
  port: parseInt(process.env.DB_PORT || '3306'),
};

async function setupDatabase() {
  const connection = await mysql.createConnection(config);

  try {
    console.log('[v0] Creating password_reset_tokens table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      )
    `);
    console.log('[v0] ✓ password_reset_tokens table created successfully');

    console.log('[v0] Creating password_reset_logs table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        action VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        status VARCHAR(20) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('[v0] ✓ password_reset_logs table created successfully');

    console.log('[v0] ✓ Database setup completed successfully!');
  } catch (error) {
    console.error('[v0] Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupDatabase();
