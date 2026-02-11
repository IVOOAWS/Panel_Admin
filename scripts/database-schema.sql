-- Tabla de Usuarios (Admins, Operadores, etc.)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'driver', 'support') DEFAULT 'operator',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Tabla de Tiendas/Sucursales
CREATE TABLE IF NOT EXISTS stores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city (city)
);

-- Tabla de Conductores/Repartidores
CREATE TABLE IF NOT EXISTS drivers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  license_number VARCHAR(100) UNIQUE,
  license_expiry DATE,
  vehicle_type ENUM('motorcycle', 'car', 'van', 'truck'),
  vehicle_plate VARCHAR(50),
  vehicle_color VARCHAR(50),
  insurance_number VARCHAR(100),
  is_available BOOLEAN DEFAULT TRUE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2),
  total_deliveries INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_available (is_available),
  INDEX idx_rating (rating)
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_phone (phone)
);

-- Tabla de Pedidos/Órdenes
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INT NOT NULL,
  store_id INT NOT NULL,
  source_platform ENUM('flety', 'yummy', 'direct') NOT NULL,
  service_type ENUM('pickup', 'delivery', 'delivery_express') NOT NULL,
  status ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
  subtotal DECIMAL(10, 2),
  delivery_fee DECIMAL(10, 2),
  total DECIMAL(10, 2),
  delivery_address VARCHAR(500),
  delivery_latitude DECIMAL(10, 8),
  delivery_longitude DECIMAL(11, 8),
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  recipient_is_third_party BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_source_platform (source_platform),
  INDEX idx_service_type (service_type),
  INDEX idx_created_at (created_at)
);

-- Tabla de Ítems de Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_name VARCHAR(255),
  product_image_url VARCHAR(500),
  description TEXT,
  quantity INT,
  unit_price DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id)
);

-- Tabla de Asignaciones de Delivery
CREATE TABLE IF NOT EXISTS deliveries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  driver_id INT,
  status ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled') DEFAULT 'pending',
  delivery_type ENUM('standard', 'express') NOT NULL,
  assigned_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  delivered_at TIMESTAMP,
  estimated_delivery_time DATETIME,
  actual_delivery_time TIMESTAMP,
  delivery_photo_url VARCHAR(500),
  recipient_signature_url VARCHAR(500),
  rating INT,
  feedback TEXT,
  route_origin_latitude DECIMAL(10, 8),
  route_origin_longitude DECIMAL(11, 8),
  route_destination_latitude DECIMAL(10, 8),
  route_destination_longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_driver_id (driver_id),
  INDEX idx_delivery_type (delivery_type)
);

-- Tabla de Pickup (para órdenes de recogida en tienda)
CREATE TABLE IF NOT EXISTS pickups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  store_id INT NOT NULL,
  status ENUM('pending', 'ready', 'picked_up', 'not_picked_up') DEFAULT 'pending',
  prepared_at TIMESTAMP,
  picked_up_at TIMESTAMP,
  picked_up_by_name VARCHAR(255),
  picked_up_by_id VARCHAR(100),
  is_third_party_pickup BOOLEAN DEFAULT FALSE,
  pickup_photo_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_store_id (store_id)
);

-- Tabla de Integraciones (Flety, Yummy)
CREATE TABLE IF NOT EXISTS integrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform_name VARCHAR(100) UNIQUE NOT NULL,
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  webhook_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_platform_name (platform_name)
);

-- Tabla de Operaciones Flety (sin integración automática)
CREATE TABLE IF NOT EXISTS flety_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  flety_order_id VARCHAR(255) UNIQUE,
  order_id INT,
  delivery_type ENUM('standard', 'express') NOT NULL,
  status VARCHAR(100),
  flety_data JSON,
  synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_delivery_type (delivery_type),
  INDEX idx_synced_at (synced_at)
);

-- Tabla de Operaciones Yummy (con integración API)
CREATE TABLE IF NOT EXISTS yummy_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  yummy_order_id VARCHAR(255) UNIQUE,
  order_id INT,
  status VARCHAR(100),
  yummy_data JSON,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_last_sync (last_sync)
);

-- Tabla de Auditoría/Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255),
  entity_type VARCHAR(100),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255),
  message TEXT,
  type ENUM('order', 'delivery', 'system', 'alert'),
  is_read BOOLEAN DEFAULT FALSE,
  related_order_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read)
);

-- Inserts iniciales (usuarios de prueba)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES 
  ('admin@delivery.com', '$2b$10$YourHashedPasswordHere', 'Administrador', 'admin'),
  ('operator@delivery.com', '$2b$10$YourHashedPasswordHere', 'Operador', 'operator')
ON DUPLICATE KEY UPDATE email = email;
