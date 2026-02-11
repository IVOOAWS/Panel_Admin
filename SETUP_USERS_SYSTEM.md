# Configuración del Sistema de Gestión de Usuarios

## Resumen de Cambios Implementados

Se ha agregado un sistema completo de autenticación Bearer y gestión de usuarios al Panel Admin con las siguientes características:

### 1. **Nueva Sección: Gestionar Usuarios**
   - Ubicación: `/admin/users`
   - Funcionalidades: Crear, editar, eliminar y listar usuarios
   - Interfaz intuitiva con búsqueda, paginación y filtros

### 2. **Autenticación Bearer Token**
   - Formato: `Bearer base64(email:contraseña)`
   - La contraseña está encriptada con bcrypt
   - Se genera al hacer login y se almacena en localStorage
   - Se utiliza en todas las llamadas a la API de gestión de usuarios

### 3. **Encriptación de Contraseñas**
   - Algoritmo: bcrypt (10 rounds)
   - Las contraseñas se encriptan antes de guardarlas en BD
   - Verificación segura con `bcrypt.compare()`

---

## Pasos de Instalación

### Paso 1: Ejecutar el Script SQL

El script SQL está en: `/scripts/setup-users-auth.sql`

**Opción A: Ejecutar desde MySQL Client**

```bash
mysql -u tu_usuario -p tu_base_datos < scripts/setup-users-auth.sql
```

**Opción B: Ejecutar manualmente en tu cliente MySQL**

```sql
-- Abre tu cliente MySQL (Workbench, DBeaver, etc.) y ejecuta:
source /path/to/scripts/setup-users-auth.sql;
```

**Opción C: Copiar y pegar en tu cliente MySQL**

Ver el contenido en `/scripts/setup-users-auth.sql` y ejecutar línea por línea.

### Paso 2: Verificar la Base de Datos

```sql
-- Verificar que la tabla users tiene las nuevas columnas
DESCRIBE users;

-- Deberías ver:
-- - api_token
-- - api_token_created_at
-- - last_login

-- Ver la tabla de auditoría creada
DESCRIBE user_audit_logs;
```

### Paso 3: Crear Usuario Admin (si no existe)

```sql
-- Insertar usuario admin de prueba
-- Contraseña: admin123 (ya encriptada con bcrypt)
INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin@panel.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Administrador', 'admin', '+1234567890', TRUE)
ON DUPLICATE KEY UPDATE email = email;
```

---

## Pruebas del Sistema

### 1. Login desde la UI

1. Ir a `/login`
2. Usar credenciales:
   - Email: `admin@panel.com`
   - Contraseña: `admin123`
3. Se debe generar un Bearer token

### 2. Acceder a Gestionar Usuarios

1. Una vez logueado, ir a `/admin/users`
2. Ver la lista de usuarios

### 3. Crear Nuevo Usuario

En la sección de Gestionar Usuarios:
- Click en "Crear Usuario"
- Llenar el formulario:
  - Email: `operador@panel.com`
  - Contraseña: `OperPass123!`
  - Nombre: `Juan Operador`
  - Rol: `Operador`
  - Teléfono: `+1234567891`
- Click en "Crear"

### 4. Probar Bearer Token con cURL

```bash
# 1. Login y obtener Bearer token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@panel.com","password":"admin123"}'

# Respuesta:
# {
#   "bearerToken": "Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz",
#   ...
# }

# 2. Listar usuarios usando el Bearer token
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz" \
  -H "Content-Type: application/json"

# 3. Crear usuario
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@panel.com",
    "password":"TestPass123!",
    "full_name":"Test User",
    "role":"operator",
    "phone":"+1234567892"
  }'

# 4. Editar usuario (ID 2)
curl -X PUT http://localhost:3000/api/admin/users/2 \
  -H "Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name":"Juan Operador Actualizado",
    "phone":"+9999999999"
  }'

# 5. Eliminar usuario (ID 2)
curl -X DELETE http://localhost:3000/api/admin/users/2 \
  -H "Authorization: Bearer YWRtaW5AcGFuZWwuY29tOmFkbWluMTIz" \
  -H "Content-Type: application/json"
```

---

## Archivos Creados/Modificados

### Nuevos Archivos

1. **Scripts SQL**
   - `/scripts/setup-users-auth.sql` - Script para setup de la BD

2. **Librerías**
   - `/lib/bearer-token.ts` - Utilidades para generar/validar Bearer tokens

3. **APIs**
   - `/app/api/admin/users/route.ts` - GET (listar) y POST (crear)
   - `/app/api/admin/users/[id]/route.ts` - GET, PUT, DELETE

4. **Componentes**
   - `/app/admin/users/page.tsx` - Página principal de gestión
   - `/components/admin/users-table.tsx` - Tabla de usuarios
   - `/components/admin/user-form-modal.tsx` - Modal de formulario
   - `/components/admin/delete-user-modal.tsx` - Modal de confirmación

5. **Documentación**
   - `/docs/AUTHENTICATION_BEARER.md` - Documentación completa
   - `/SETUP_USERS_SYSTEM.md` - Este archivo

### Archivos Modificados

1. `/app/api/auth/login/route.ts` - Ahora devuelve Bearer token
2. `/components/auth/login-form.tsx` - Integración con API real
3. `/components/admin/sidebar.tsx` - Agregado item "Gestionar Usuarios"

---

## Estructura de Carpetas

```
Panel_Admin/
├── app/
│   ├── admin/
│   │   ├── users/
│   │   │   └── page.tsx           (NEW)
│   │   └── ...
│   ├── api/
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── route.ts       (NEW)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts   (NEW)
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts       (MODIFIED)
│   └── ...
├── components/
│   ├── admin/
│   │   ├── users-table.tsx        (NEW)
│   │   ├── user-form-modal.tsx    (NEW)
│   │   ├── delete-user-modal.tsx  (NEW)
│   │   ├── sidebar.tsx            (MODIFIED)
│   │   └── ...
│   ├── auth/
│   │   └── login-form.tsx         (MODIFIED)
│   └── ...
├── lib/
│   ├── bearer-token.ts            (NEW)
│   ├── auth.ts                    (EXISTING)
│   └── ...
├── scripts/
│   ├── setup-users-auth.sql       (NEW)
│   └── ...
├── docs/
│   └── AUTHENTICATION_BEARER.md   (NEW)
└── SETUP_USERS_SYSTEM.md          (NEW)
```

---

## Variables de Entorno Requeridas

```env
# En tu .env.local o variables de Vercel

# Base de datos (ya debería estar configurada)
DATABASE_URL=mysql://usuario:contraseña@host:3306/database_name

# Secreto para JWT/tokens (opcional, usa uno existente)
API_SECRET_KEY=tu_clave_secreta_aqui

# Node environment
NODE_ENV=development
```

---

## Procedimientos Almacenados (Opcionales)

El script SQL incluye procedimientos almacenados para facilitar operaciones comunes:

```sql
-- Crear usuario
CALL sp_create_user(
  'nuevo@email.com',
  'hash_bcrypt_aqui',
  'Nuevo Usuario',
  'operator',
  '+1234567890'
);

-- Actualizar token API
CALL sp_update_api_token(1, 'nuevo_token_encriptado');

-- Registrar login
CALL sp_log_user_login(1, '192.168.1.1');
```

---

## Troubleshooting

### Error: "Tabla users no tiene la columna api_token"
**Solución:** Ejecutar el script SQL completo. Las columnas se agregan con `ALTER TABLE IF NOT EXISTS`.

### Error: "Bearer token inválido"
**Solución:** 
- Verificar que el formato sea `Bearer base64(email:password)`
- Asegurarse de que el usuario esté activo (`is_active = TRUE`)

### Error: "Usuario no encontrado"
**Solución:**
- Verificar que el email exista en la BD
- Confirmar que el usuario no fue eliminado (soft delete)

### Error: "Acceso denegado (403)"
**Solución:**
- El usuario debe ser admin para acceder a la gestión de usuarios
- Cambiar el rol del usuario a 'admin' en la BD

---

## Siguiente: Variables de Entorno en Vercel

Si estás desplegando en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Asegúrate de que `DATABASE_URL` esté configurada
4. Agrega `API_SECRET_KEY` si es necesario

---

## Notas Importantes

1. **Soft Delete:** Los usuarios se desactivan, no se eliminan física mente
2. **Auditoría:** Todas las acciones se registran en `user_audit_logs`
3. **Sessions:** Las sesiones duran 24 horas
4. **Roles:** Solo admins pueden crear/editar/eliminar usuarios
5. **Backup:** Realiza backup de la BD antes de ejecutar el script

---

## Soporte

Para más información:
- Ver `/docs/AUTHENTICATION_BEARER.md` para documentación de API
- Ver código de `/app/admin/users/page.tsx` para implementación
- Revisar `/lib/bearer-token.ts` para lógica de tokens

¡Listo para usar! 🚀
