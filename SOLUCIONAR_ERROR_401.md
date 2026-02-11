# Solucionar Error 401 en Login

Recibiste error **401 (Unauthorized)** al intentar login. Aquí está la solución.

## ⚡ Solución Rápida (5 minutos)

### Paso 1: Ejecutar Script de Verificación
```bash
node scripts/verify-database.js
```

Este script te dirá exactamente cuál es el problema.

### Paso 2: Si la tabla NO existe
Ejecuta en tu MySQL client:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/setup-users-auth.sql
```

O copiar/pegar el contenido de `scripts/setup-users-auth.sql` en tu cliente MySQL.

### Paso 3: Si NO hay usuarios
Ejecuta en tu MySQL client:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user.sql
```

O ejecuta este comando SQL:
```sql
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Admin', 'admin', '+1234567890', TRUE);
```

### Paso 4: Reiniciar servidor
```bash
npm run dev
```

### Paso 5: Intentar login
- **Email:** admin@empresa.com
- **Contraseña:** admin123

---

## 📋 Checklist

- [ ] Ejecuté `verify-database.js` y vi el resultado
- [ ] La tabla `users` existe
- [ ] Hay al menos un usuario activo
- [ ] El usuario `admin@empresa.com` está activo
- [ ] Reinicié el servidor con `npm run dev`
- [ ] Intento login con admin@empresa.com / admin123

---

## 🔍 Diagnóstico Manual

Si quieres revisar manualmente:

### 1. Conectar a MySQL
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp
```

### 2. Ver tablas
```sql
SHOW TABLES;
```

Deberías ver una tabla llamada `users`.

### 3. Ver usuarios
```sql
SELECT * FROM users;
```

Deberías ver al menos el usuario admin@empresa.com.

### 4. Ver estructura
```sql
DESC users;
```

Deberías ver columnas como: id, email, password_hash, full_name, role, is_active, etc.

### 5. Verificar usuario específico
```sql
SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = 'admin@empresa.com';
```

---

## 🆘 Si Nada Funciona

1. **Verifica que MySQL está corriendo:**
```bash
# En Linux/Mac:
mysql -h localhost -u root -p

# Si te pide contraseña, MySQL está corriendo
```

2. **Verifica el DATABASE_URL en .env.local:**
```
DATABASE_URL=mysql://creditivoo_ordersuser:C4ed1t1voo@localhost:3306/creditivoo_ivooApp
```

3. **Verifica que la base de datos existe:**
```sql
SHOW DATABASES;
```

Deberías ver `creditivoo_ivooApp`.

4. **Verifica que tienes permisos:**
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "SELECT 1;"
```

5. **Revisa los logs del servidor:**
   - Abre la consola del servidor (donde ejecutaste `npm run dev`)
   - Busca líneas que comiencen con `[v0]`
   - Copialas y analiza qué está fallando

---

## 📝 Información de Conexión

```
Host: localhost
Usuario: creditivoo_ordersuser
Contraseña: C4ed1t1voo
Base de datos: creditivoo_ivooApp
Puerto: 3306 (por defecto)
```

---

## ✅ Una Vez Que Funcione

Si el login funciona:
1. Irás al dashboard
2. Verás "Gestionar Usuarios" en el sidebar
3. Podrás crear, editar y eliminar usuarios
4. El Bearer token se guardará automáticamente

¡Listo! 🎉
