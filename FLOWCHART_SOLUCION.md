# Flowchart de Solución para Error 401

## 🌳 Árbol de Decisiones

```
┌─── RECIBO ERROR 401 ──────────────────────────────────────────┐
│                                                                 │
├─ PASO 1: ¿LA TABLA USERS EXISTE?                               │
│  │                                                              │
│  ├─ NO: Ejecuta scripts/setup-users-auth.sql                   │
│  │       mysql -h localhost -u creditivoo_ordersuser           │
│  │       -pC4ed1t1voo creditivoo_ivooApp < scripts/...         │
│  │       ⬇️                                                     │
│  │ Verifica que se creó: SHOW TABLES;                          │
│  │                                                              │
│  └─ SÍ: Continúa ⬇️                                             │
│                                                                 │
├─ PASO 2: ¿EXISTE EL USUARIO admin@empresa.com?                 │
│  │                                                              │
│  ├─ NO: Ejecuta scripts/insert-test-user.sql                   │
│  │       O copia/pega el SQL de insert-test-user.sql           │
│  │       ⬇️                                                     │
│  │ Verifica: SELECT * FROM users WHERE email='admin@empresa';  │
│  │                                                              │
│  └─ SÍ: Continúa ⬇️                                             │
│                                                                 │
├─ PASO 3: ¿EL USUARIO ESTÁ ACTIVO (is_active = 1)?              │
│  │                                                              │
│  ├─ NO: Actívalo                                               │
│  │       UPDATE users SET is_active = TRUE                     │
│  │       WHERE email = 'admin@empresa.com';                    │
│  │       ⬇️                                                     │
│  │                                                              │
│  └─ SÍ: Continúa ⬇️                                             │
│                                                                 │
├─ PASO 4: ¿LA CONTRASEÑA HASH ES CORRECTA?                      │
│  │                                                              │
│  ├─ NO: El hash no es para 'admin123'                          │
│  │       Opción A: Cambia el password_hash a:                  │
│  │       $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeK...        │
│  │                                                              │
│  │       Opción B: Usa la contraseña que corresponde al hash   │
│  │       ⬇️                                                     │
│  │                                                              │
│  └─ SÍ: Continúa ⬇️                                             │
│                                                                 │
├─ PASO 5: ¿REINICIASTE EL SERVIDOR?                             │
│  │                                                              │
│  ├─ NO: npm run dev                                            │
│  │       ⬇️                                                     │
│  │                                                              │
│  └─ SÍ: Continúa ⬇️                                             │
│                                                                 │
├─ PASO 6: INTENTA LOGIN                                         │
│  │                                                              │
│  ├─ Email: admin@empresa.com                                   │
│  ├─ Password: admin123                                         │
│  │                                                              │
│  └─ ⬇️                                                          │
│                                                                 │
├─ ✅ LOGIN EXITOSO                                               │
│  │                                                              │
│  └─ Verás el Dashboard                                         │
│     Accede a "Gestionar Usuarios"                              │
│     Crea más usuarios                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Scripts de Ayuda

### Script 1: Verificar Base de Datos
```bash
node scripts/verify-database.js
```
**Qué hace:** Te dirá exactamente cuál es el problema

### Script 2: Test de Autenticación
```bash
node scripts/test-auth.js
```
**Qué hace:** Verifica que la autenticación funcione correctamente

## 📋 Checklist Rápido

```
[ ] ¿Ejecuté scripts/setup-users-auth.sql?
[ ] ¿Ejecuté scripts/insert-test-user.sql?
[ ] ¿La tabla users existe? → SELECT COUNT(*) FROM users;
[ ] ¿Existe admin@empresa.com? → SELECT * FROM users WHERE email='admin@empresa.com';
[ ] ¿El usuario está activo? → Check is_active = 1
[ ] ¿Reinicié el servidor? → npm run dev
[ ] ¿Intento login con admin@empresa.com / admin123?
[ ] ¿Veo [v0] logs en la consola del servidor?
```

## 📊 Estados Posibles

### Estado 1: Error 401 - Usuario No Encontrado
```
[v0] Login attempt for: admin@empresa.com
[v0] Query result: []
[v0] Users array check: true Length: 0
[v0] Usuario no encontrado: admin@empresa.com
```
**Solución:** Ejecuta `scripts/insert-test-user.sql`

### Estado 2: Error 401 - Contraseña Incorrecta
```
[v0] Login attempt for: admin@empresa.com
[v0] Usuario encontrado: admin@empresa.com
[v0] Password valid: false
[v0] Contraseña incorrecta para: admin@empresa.com
```
**Solución:** Verifica que el hash sea para la contraseña 'admin123' o actualízalo

### Estado 3: Error 403 - Usuario Inactivo
```
[v0] Usuario inactivo: admin@empresa.com
```
**Solución:** Ejecuta `UPDATE users SET is_active = TRUE WHERE email = 'admin@empresa.com';`

### Estado 4: Login Exitoso ✅
```
[v0] Credenciales válidas para: admin@empresa.com
[v0] Bearer token generado para: admin@empresa.com
[v0] Sesión creada para: admin@empresa.com
```
**Resultado:** Te redirige al dashboard

## 🚀 Siguiente Paso

Una vez que el login funcione:
1. Ve al Dashboard
2. Click en "Gestionar Usuarios" en el sidebar
3. Crea nuevos usuarios
4. Edita usuarios existentes
5. Elimina usuarios si es necesario

¡Listo! Tu sistema de autenticación con Bearer tokens está funcionando. 🎉
