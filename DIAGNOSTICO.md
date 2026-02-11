# Diagnóstico del Error 401

## Problema
Estás recibiendo error 401 (Unauthorized) al intentar login.

## Posibles Causas

### 1. El usuario no existe en la base de datos
```sql
-- Ejecuta esto en tu MySQL:
SELECT * FROM users WHERE email = 'admin@empresa.com';

-- Si no hay resultados, ejecuta:
SOURCE scripts/insert-test-user.sql;
```

### 2. La contraseña no coincide
El hash bcrypt predefinido en el script es para: **admin123**

### 3. El usuario está inactivo
```sql
-- Verifica esto:
SELECT email, is_active FROM users;

-- Si está inactivo, actívalo:
UPDATE users SET is_active = TRUE WHERE email = 'admin@empresa.com';
```

## Pasos de Diagnóstico

### Paso 1: Verificar Base de Datos
```bash
# En tu cliente MySQL:
mysql -h localhost -u creditivoo_ordersuser -p"C4ed1t1voo" creditivoo_ivooApp

# Dentro de MySQL:
SHOW TABLES;
DESC users;
SELECT COUNT(*) FROM users;
SELECT * FROM users;
```

### Paso 2: Verificar que la tabla existe
```sql
SHOW COLUMNS FROM users;
```

Debería mostrar estas columnas:
- id (INT)
- email (VARCHAR)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- role (ENUM)
- phone (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
- api_token (VARCHAR)
- api_token_created_at (TIMESTAMP)

### Paso 3: Insertar usuario de prueba
```sql
-- Contraseña: admin123 (bcrypt hash)
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Admin', 'admin', '+1234567890', TRUE);

-- Verificar
SELECT * FROM users WHERE email = 'admin@empresa.com';
```

### Paso 4: Probar Login en la Consola
1. Abre el navegador (F12) → Consola
2. Ejecuta:
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@empresa.com', 
    password: 'admin123' 
  }),
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log(d));
```

3. Revisa la respuesta y busca mensajes de error

## Credenciales de Prueba

**Email:** admin@empresa.com
**Contraseña:** admin123

## Logs a Revisar

Abre tu navegador (F12) → Consola y busca:
- `[v0] Login attempt for:`
- `[v0] Buscando usuario en BD`
- `[v0] Query result:`
- `[v0] Password valid:`

Estos logs te dirán exactamente dónde está fallando.

## Si Todo Falla

1. Elimina el usuario y vuelve a crearlo:
```sql
DELETE FROM users WHERE email = 'admin@empresa.com';
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Admin', 'admin', '+1234567890', TRUE);
SELECT * FROM users WHERE email = 'admin@empresa.com';
```

2. Reinicia el servidor:
```bash
npm run dev
```

3. Intenta login nuevamente con:
   - Email: admin@empresa.com
   - Password: admin123

## Información de Conexión Actual

```
DATABASE_URL=mysql://creditivoo_ordersuser:C4ed1t1voo@localhost:3306/creditivoo_ivooApp
```

Verifica que:
- Host: localhost ✓
- Usuario: creditivoo_ordersuser ✓
- Contraseña: C4ed1t1voo ✓
- Base de datos: creditivoo_ivooApp ✓

## Próximos Pasos

Una vez que logues correctamente, deberías:
1. Ver el dashboard
2. Ir a "Gestionar Usuarios"
3. Crear más usuarios
4. Cambiar contraseñas según sea necesario
