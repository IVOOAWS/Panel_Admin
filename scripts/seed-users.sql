-- Insertar usuario admin de prueba (contraseña: admin123)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('admin@delivery.com', '$2a$10$KIXxPfxQXu.xW9QQq/qtxOOzwAXn0wEqmKZmWmDfkrKn5q.tHFB.K', 'Administrador', 'admin');

-- Insertar usuario operador de prueba (contraseña: operator123)
INSERT INTO users (email, password_hash, full_name, role) 
VALUES ('operator@delivery.com', '$2a$10$dXJ3SW6G7P50eS3Q5g8.2eUZbVHu5.7SzZeKPkT5FN8v5Fy7zLqxK', 'Operador', 'operator');
