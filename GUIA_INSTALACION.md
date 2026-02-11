# 🚀 Guía de Instalación Paso a Paso

## ⚙️ Prerrequisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado y corriendo
- Cliente MySQL (MySQL Workbench, DBeaver, o CLI)
- El repositorio clonado localmente

---

## 📋 Checklist de Instalación

### PASO 1️⃣: Preparar Base de Datos

#### 1.1 Crear Base de Datos (si no existe)

```sql
CREATE DATABASE admin_panel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE admin_panel;
```

#### 1.2 Ejecutar Script SQL

Abre tu cliente MySQL y ejecuta el contenido de:
```
scripts/setup-users-auth.sql
```

O desde la línea de comandos:
```bash
mysql -u tu_usuario -p tu_base_datos < scripts/setup-users-auth.sql
```

#### 1.3 Verificar Tablas Creadas

```sql
SHOW TABLES;
-- Deberías ver: users, user_audit_logs

DESCRIBE users;
-- Verifica que la tabla tiene las columnas correctas
```

✅ **Paso 1 completado** cuando ves las tablas creadas

---

### PASO 2️⃣: Configurar Variables de Entorno

#### 2.1 Crear archivo `.env.local`

En la raíz del proyecto, crea el archivo:
```
/vercel/share/v0-project/.env.local
```

#### 2.2 Agregar configuración de Base de Datos

```
# Base de Datos MySQL
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/admin_panel

# O si usas la variable de conexión alternativa:
MYSQL_HOST=localhost
MYSQL_USER=tu_usuario
MYSQL_PASSWORD=tu_contraseña
MYSQL_DATABASE=admin_panel
MYSQL_PORT=3306
```

**Reemplaza con tus credenciales reales**

#### 2.3 Verificar Conexión

Ejecuta un test simple:
```bash
npm run dev
```

Si ves logs sin errores de BD, ¡la conexión funciona!

✅ **Paso 2 completado** cuando la app inicia sin errores

---

### PASO 3️⃣: Instalar Dependencias

#### 3.1 Instalar paquetes necesarios

Si es la primera vez, ejecuta:
```bash
npm install
```

O si usas yarn/pnpm:
```bash
# Yarn
yarn install

# pnpm
pnpm install
```

#### 3.2 Verificar instalación

```bash
npm list bcryptjs
npm list next
npm list react
```

Todos deben mostrar versiones sin errores

✅ **Paso 3 completado** cuando todos los packages están instalados

---

### PASO 4️⃣: Crear Usuario Admin Inicial

#### 4.1 Generar Hash Bcrypt

Usa un generador online o Node.js:

**Opción A: Online (rápido)**
- Ve a: https://bcrypt-generator.com
- Contraseña: `admin123`
- Copia el hash (ej: `$2a$10$...`)

**Opción B: Node.js (seguro)**
```bash
node
> const bcrypt = require('bcryptjs');
> bcrypt.hash('admin123', 10, (err, hash) => console.log(hash));
// Espera el resultado y cópialo
```

#### 4.2 Crear Usuario Admin en BD

```sql
INSERT INTO users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@empresa.com',
  '$2a$10$ABC123XYZ...', -- Reemplaza con tu hash
  'Administrador',
  'admin',
  TRUE
);

-- Verifica la inserción
SELECT id, email, full_name, role FROM users;
```

✅ **Paso 4 completado** cuando ves el usuario en la tabla

---

### PASO 5️⃣: Iniciar la Aplicación

#### 5.1 Comando de Desarrollo

```bash
npm run dev
```

Deberías ver:
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

#### 5.2 Abrir en Navegador

Ve a: http://localhost:3000

Deberías ver la página de login

✅ **Paso 5 completado** cuando ves la app en el navegador

---

### PASO 6️⃣: Hacer Login

#### 6.1 Credenciales
- Email: `admin@empresa.com`
- Password: `admin123`

#### 6.2 Test de Login

1. Abre http://localhost:3000/login
2. Ingresa email y contraseña
3. Click en "Inicia Sesión"
4. Deberías ser redirigido a `/admin/dashboard`

#### 6.3 Verificar Bearer Token

Abre la consola del navegador (F12) y ejecuta:
```javascript
localStorage.getItem('bearerToken')
```

Deberías ver algo como:
```
YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=
```

✅ **Paso 6 completado** cuando estás logueado y ves el Bearer token

---

### PASO 7️⃣: Acceder a Gestión de Usuarios

#### 7.1 Navegar al Panel

1. En el sidebar, busca "Gestionar Usuarios"
2. Click en la opción
3. Deberías ver la URL: `http://localhost:3000/admin/users`

#### 7.2 Ver Tabla de Usuarios

En la página, deberías ver:
- Tabla con el usuario admin que creaste
- Botón "Crear Usuario"
- Columnas: Email, Nombre, Rol, Activo, Acciones

✅ **Paso 7 completado** cuando ves la tabla con datos

---

### PASO 8️⃣: Probar Crear Usuario

#### 8.1 Click en "Crear Usuario"

Se abre un modal con formulario

#### 8.2 Llenar Formulario

```
Email:      juan@empresa.com
Contraseña: JuanPass123
Nombre:     Juan Pérez
Rol:        user
```

#### 8.3 Click en "Crear"

Deberías ver:
- ✅ Notificación de éxito
- ✅ Nuevo usuario en la tabla
- ✅ Modal se cierra

#### 8.4 Verificar en BD

```sql
SELECT * FROM users WHERE email = 'juan@empresa.com';
```

Deberías ver el nuevo usuario con contraseña hasheada

✅ **Paso 8 completado** cuando el usuario aparece en la tabla

---

### PASO 9️⃣: Probar Editar Usuario

#### 9.1 Click en "Editar" para el usuario Juan

Se abre modal con datos cargados

#### 9.2 Cambiar Nombre

```
Nombre: Juan Pérez Actualizado
```

#### 9.3 Click en "Actualizar"

El usuario se actualiza en la tabla

✅ **Paso 9 completado** cuando ves el cambio reflejado

---

### PASO 🔟: Probar Eliminar Usuario

#### 10.1 Click en "Eliminar" para Juan

Se abre modal de confirmación

#### 10.2 Confirmar Eliminación

Click en "Sí, eliminar"

#### 10.3 Verificar Eliminación

Usuario desaparece de la tabla

#### 10.4 Verificar en BD

```sql
SELECT * FROM users;
-- Juan ya no debe estar en la lista
```

✅ **Paso 10 completado** cuando el usuario está eliminado

---

### PASO 1️⃣1️⃣: Probar API con cURL

#### 11.1 Obtener Bearer Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "bearerToken": "YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=",
  ...
}
```

#### 11.2 Listar Usuarios

```bash
TOKEN="YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM="
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

Deberías recibir la lista de usuarios en JSON

#### 11.3 Crear Usuario por API

```bash
TOKEN="YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM="
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@empresa.com",
    "password": "CarlosPass123",
    "full_name": "Carlos López",
    "role": "user"
  }'
```

✅ **Paso 11 completado** cuando las APIs responden correctamente

---

### PASO 1️⃣2️⃣: Probar en Producción (Opcional)

#### 12.1 Build de Producción

```bash
npm run build
```

Deberías ver:
```
> next build
Route (app)                              ...
✓ Compiled successfully
```

#### 12.2 Ejecutar Producción

```bash
npm run start
```

Deberías ver:
```
> next start
  ▲ Next.js 15.1.0
  - ready started server on 0.0.0.0:3000
```

#### 12.3 Probar en Navegador

Ve a http://localhost:3000/login

Intenta hacer login y navegar

✅ **Paso 12 completado** cuando todo funciona en producción

---

## 🆘 Solución de Problemas

### ❌ Error: "Cannot find module 'bcryptjs'"

**Solución:**
```bash
npm install bcryptjs
npm install @types/bcryptjs --save-dev
```

---

### ❌ Error: "Connection refused" (Base de Datos)

**Causas posibles:**
1. MySQL no está corriendo
2. Credenciales incorrectas
3. Base de datos no existe

**Solución:**
```bash
# Verifica que MySQL corre
mysql -u tu_usuario -p -e "SELECT 1;"

# Verifica credenciales en .env.local
# Verifica que la BD existe
mysql -u tu_usuario -p -e "SHOW DATABASES;"
```

---

### ❌ Error: "Email already exists"

**Causa:** Usuario ya existe en la BD

**Solución:**
```sql
-- Usa otro email o elimina el usuario
DELETE FROM users WHERE email = 'admin@empresa.com';
```

---

### ❌ Error: "Invalid Bearer token"

**Causa:** Token mal formado o expirado

**Solución:**
```javascript
// En la consola:
localStorage.removeItem('bearerToken');
// Luego haz login nuevamente
```

---

### ❌ Error: "Table 'users' doesn't exist"

**Causa:** Script SQL no se ejecutó correctamente

**Solución:**
```bash
# Ejecuta el script nuevamente
mysql -u tu_usuario -p tu_base_datos < scripts/setup-users-auth.sql

# O manualmente en MySQL:
mysql -u tu_usuario -p
use admin_panel;
source scripts/setup-users-auth.sql;
```

---

## ✅ Verificación Final

Cuando todo esté configurado, ejecuta este checklist:

- [ ] Base de datos creada
- [ ] Tablas creadas (users, user_audit_logs)
- [ ] Usuario admin creado
- [ ] Variables de entorno configuradas
- [ ] Aplicación inicia sin errores
- [ ] Puedo hacer login
- [ ] Veo "Gestionar Usuarios" en sidebar
- [ ] Puedo crear usuarios
- [ ] Puedo editar usuarios
- [ ] Puedo eliminar usuarios
- [ ] APIs responden con cURL
- [ ] Build de producción funciona

---

## 📞 Contacto y Soporte

Si tienes problemas:

1. **Lee la documentación:**
   - `README_USUARIOS.md`
   - `IMPLEMENTACION_COMPLETA.md`
   - `BEARER_TOKEN_GUIDE.md`

2. **Revisa los logs:**
   ```bash
   # En el terminal donde corre npm run dev
   # Deberías ver logs detallados
   ```

3. **Verifica la BD:**
   ```sql
   SHOW TABLES;
   SHOW COLUMNS FROM users;
   SELECT COUNT(*) FROM users;
   ```

---

## 🎉 ¡Felicidades!

Si completaste todos los pasos, ¡tu sistema está listo!

**Próximos pasos opcionales:**
- Personaliza colores y estilos
- Agrega más campos a usuarios
- Implementa 2FA
- Configura backup automático
- Deploy a producción

---

**Última actualización:** 2024-02-10  
**Versión:** 1.0.0
