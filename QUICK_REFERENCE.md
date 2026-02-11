# 📌 Tarjeta de Referencia Rápida

## 🚀 Instalación Express (7 pasos)

```bash
# 1. Ejecutar SQL
mysql -u usuario -p bd < scripts/setup-users-auth.sql

# 2. Crear .env.local
echo "DATABASE_URL=mysql://user:pass@localhost:3306/bd" > .env.local

# 3. Instalar
npm install

# 4. Crear usuario admin (en MySQL)
# INSERT INTO users... (ver GUIA_INSTALACION.md paso 4)

# 5. Iniciar
npm run dev

# 6. Login en http://localhost:3000/login
# admin@empresa.com / admin123

# 7. Sidebar → "Gestionar Usuarios"
```

---

## 🌐 Endpoints API

| Método | URL | Función | Bearer |
|--------|-----|---------|--------|
| POST | `/api/auth/login` | Login | ❌ |
| GET | `/api/admin/users` | Listar | ✅ |
| POST | `/api/admin/users` | Crear | ✅ |
| PUT | `/api/admin/users/[id]` | Editar | ✅ |
| DELETE | `/api/admin/users/[id]` | Eliminar | ✅ |

---

## 💻 cURL Rápido

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email":"admin@empresa.com","password":"admin123"}' \
  -H "Content-Type: application/json"

# Listar (reemplaza TOKEN)
TOKEN="YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM="
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# Crear
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"nuevo@empresa.com",
    "password":"Pass123",
    "full_name":"Juan",
    "role":"user"
  }'
```

---

## 📁 Archivos Clave

```
app/api/admin/users/
  ├── route.ts .................... GET/POST
  └── [id]/route.ts ............... PUT/DELETE

components/admin/
  ├── users-table.tsx ............ Tabla
  ├── user-form-modal.tsx ........ Crear/Editar
  └── delete-user-modal.tsx ...... Eliminar

app/admin/users/page.tsx ......... Página principal
lib/bearer-token.ts ............. Funciones Bearer
scripts/setup-users-auth.sql .... Script BD
```

---

## 🔐 Bearer Token

```
¿Qué es?
  Base64(email:password)

Ejemplo:
  admin@empresa.com:admin123
  → YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=

¿Cómo se usa?
  Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=

¿Dónde se guarda?
  localStorage.bearerToken  (JavaScript)
  Cookie HTTP-only          (Servidor)
```

---

## 🗄️ Base de Datos

### Tabla: users
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
email       VARCHAR(255) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
full_name   VARCHAR(255)
role        ENUM('admin', 'user')
is_active   BOOLEAN DEFAULT TRUE
created_at  TIMESTAMP
updated_at  TIMESTAMP
last_login  TIMESTAMP
```

### Tabla: user_audit_logs
```sql
id          INT PRIMARY KEY
user_id     INT FOREIGN KEY → users.id
action      VARCHAR(100) [LOGIN, CREATE, UPDATE, DELETE]
details     JSON
created_at  TIMESTAMP
```

---

## 📝 Formulario: Crear Usuario

```
Email:        text (requerido, único)
Contraseña:   password (8+ caracteres, requerido)
Nombre:       text (requerido)
Rol:          select (admin / user)
```

---

## 🔧 Configuración .env.local

```
# Mínimo requerido
DATABASE_URL=mysql://usuario:contraseña@localhost:3306/nombre_bd

# O alternativamente
MYSQL_HOST=localhost
MYSQL_USER=usuario
MYSQL_PASSWORD=contraseña
MYSQL_DATABASE=nombre_bd
MYSQL_PORT=3306
```

---

## 🎨 Componentes Creados

```
UsersPage         ← app/admin/users/page.tsx
UsersTable        ← components/admin/users-table.tsx
UserFormModal     ← components/admin/user-form-modal.tsx
DeleteUserModal   ← components/admin/delete-user-modal.tsx

Modificados:
LoginForm         ← Integrada con API real
Sidebar           ← Agregado item "Gestionar Usuarios"
LoginRoute        ← Genera Bearer token
```

---

## 🆘 Troubleshooting 1-2-3

| Error | Causa | Solución |
|-------|-------|----------|
| Table users doesn't exist | SQL no ejecutado | Ejecutar `setup-users-auth.sql` |
| Bearer token inválido | Token mal formado | Verificar Base64 correcto |
| Connection refused | MySQL apagado | `service mysql start` |
| User not found | BD vacía | INSERT usuario admin |
| 404 en /admin/users | Archivo no existe | Verificar archivo creado |

---

## 📊 Resumen de Cambios

```
Archivos Nuevos:        12
Archivos Modificados:   3
Líneas de Código:       ~2,300
Documentación:          ~3,400
Endpoints API:          5
Componentes React:      5
Tablas BD:              2
```

---

## 🔑 Credenciales por Defecto

```
Email:    admin@empresa.com
Password: admin123  (después de crear con Bcrypt)
```

---

## ✅ Checklist Pre-Launch

- [ ] Script SQL ejecutado
- [ ] .env.local configurado
- [ ] npm install corrió
- [ ] Usuario admin creado
- [ ] npm run dev inicia sin errores
- [ ] Login funciona
- [ ] Puedo navegar a /admin/users
- [ ] Tabla muestra usuario admin
- [ ] Puedo crear usuario
- [ ] Puedo editar usuario
- [ ] Puedo eliminar usuario
- [ ] cURL funciona

---

## 🧪 Test Rápido

```javascript
// Consola navegador (F12)
localStorage.getItem('bearerToken')
// Si devuelve un string = ✅ OK

// Test de API
fetch('/api/admin/users', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('bearerToken') }
}).then(r => r.json()).then(console.log)
// Si devuelve users = ✅ OK
```

---

## 📚 Documentación Mínima

- `README_USUARIOS.md` - Comienza aquí (10 min)
- `GUIA_INSTALACION.md` - Instalación (30 min)
- `IMPLEMENTACION_COMPLETA.md` - Endpoints (15 min)

---

## 🔗 URLs Principales

```
Login:          http://localhost:3000/login
Dashboard:      http://localhost:3000/admin/dashboard
Usuarios:       http://localhost:3000/admin/users
API Auth:       http://localhost:3000/api/auth/login
API Usuarios:   http://localhost:3000/api/admin/users
```

---

## ⏱️ Tiempos Aproximados

```
Instalación:    15 min
Configuración:  10 min
Testing:        10 min
Lectura docs:   60 min
---
Total:          ~95 min
```

---

## 🎯 Próximas Acciones

```
HOY:
  1. Leer INICIO_RAPIDO.md (5 min)
  2. Ejecutar GUIA_INSTALACION.md (30 min)
  3. Probar en navegador (5 min)

ESTA SEMANA:
  1. Leer documentación completa
  2. Personalizar UI
  3. Agregar campos extra

ESTE MES:
  1. JWT + expiración
  2. 2FA
  3. Paginación
```

---

## 📞 Links Útiles

- `INDEX.md` - Navegación completa
- `INICIO_RAPIDO.md` - Start en 15 min
- `BEARER_TOKEN_GUIDE.md` - Entender autenticación
- `docs/API_EXAMPLES.md` - Ejemplos de código
- `RESUMEN_VISUAL.md` - Diagramas

---

## ✨ Features

✅ Crear usuarios  
✅ Editar usuarios  
✅ Eliminar usuarios  
✅ Listar usuarios  
✅ Autenticación Bearer  
✅ Contraseñas encriptadas (Bcrypt)  
✅ Auditoría  
✅ Interfaz moderna  
✅ API RESTful  
✅ Documentación completa  

---

## 🚀 ¡Listo!

**Siguiente paso:** Abre `INICIO_RAPIDO.md`

---

**Creado:** 2024-02-10 | **Versión:** 1.0.0
