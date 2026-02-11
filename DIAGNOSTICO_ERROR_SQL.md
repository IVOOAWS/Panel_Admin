# Diagnóstico del Error SQL

## Paso 1: Verifica la estructura de la tabla

Ejecuta esto en MySQL directamente:

```sql
DESCRIBE users;
SHOW KEYS FROM users;
```

## Paso 2: Verifica qué hay en la tabla

```sql
SELECT COUNT(*) FROM users;
SELECT * FROM users;
```

## Paso 3: Intenta insertar manualmente

```sql
INSERT INTO users (email, password_hash, full_name, role, is_active) 
VALUES ('test@test.com', 'hash123', 'Test User', 'admin', 1);
```

## Paso 4: Si el error dice "columna no existe"

Verifica qué columnas tiene la tabla:

```sql
SHOW COLUMNS FROM users;
```

## Paso 5: Posibles causas del error

| Error | Solución |
|-------|----------|
| `Column 'phone' doesn't exist` | Ejecuta: `ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;` |
| `Column 'last_login' doesn't exist` | Ejecuta: `ALTER TABLE users ADD COLUMN last_login DATETIME NULL;` |
| `Duplicate entry` | El usuario ya existe. Ejecuta: `DELETE FROM users WHERE email = 'admin@empresa.com';` |
| `Cannot add or update a child row` | Hay una foreign key. Ignora y usa el script simple. |

## Pasos de Recuperación

### Opción 1: Script Simple (SIN DELETE)
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user-simple.sql
```

### Opción 2: Insertar Directamente en Terminal MySQL

```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp
```

Luego ejecuta:
```sql
INSERT INTO users (email, password_hash, full_name, role, is_active) 
VALUES ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador', 'admin', 1);
```

### Opción 3: Si todo falla, recrea la tabla

```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/setup-users-auth.sql
```

Luego:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user.sql
```

## Verifica que funcionó

Después de cualquier opción, ejecuta:

```sql
SELECT id, email, full_name, role, is_active FROM users WHERE email = 'admin@empresa.com';
```

Deberías ver 1 fila con los datos del usuario admin.

## Compartir el error

Si ninguna opción funciona, copia el error exacto y pégalo aquí. El formato típico es:

```
ERROR 1054 (42S22): Unknown column 'phone' in 'field list'
```

Así puedo ayudarte mejor.
