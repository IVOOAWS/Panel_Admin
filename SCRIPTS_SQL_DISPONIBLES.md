# Scripts SQL Disponibles

## Resumen de Todos los Scripts

En el proyecto tienes disponibles varios scripts SQL. Aquí te muestro cuáles son, qué hace cada uno y cuáles necesitas ejecutar.

---

## Scripts por Propósito

### 1. Tabla Principal de Usuarios

**Archivo**: `scripts/users-table.sql` ⭐ **RECOMENDADO**

**Descripción**: Script limpio y completo para crear la tabla `users` con toda la información necesaria para login.

**Incluye**:
- Tabla `users` completa
- Todos los campos necesarios para autenticación
- Índices para optimización
- Usuario admin de prueba (admin@empresa.com / admin123)
- Comentarios explicativos
- Queries útiles

**Cuándo usar**: SIEMPRE este script. Es el más completo y moderno.

**Comando**:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/users-table.sql
```

---

### 2. Script Original Completo

**Archivo**: `scripts/setup-users-auth.sql`

**Descripción**: Script antiguo que intenta crear varias tablas y procedimientos almacenados.

**Incluye**:
- Tabla `users`
- Tabla `user_audit_logs` (logs de auditoría)
- Procedimientos almacenados
- Intenta insertar usuario admin (puede fallar)

**Cuándo usar**: NO RECOMENDADO. Usa `scripts/users-table.sql` en su lugar.

**Problemas**:
- Demasiado complejo
- Puede tener errores de sintaxis
- Los procedimientos almacenados no se usan en la app
- Error en inserciones con ON DUPLICATE KEY

---

### 3. Script de Reset de Contraseña

**Archivo**: `scripts/create-password-reset-table.sql`

**Descripción**: Crea la tabla `password_reset_tokens` para el sistema de "Olvidar Contraseña".

**Incluye**:
- Tabla `password_reset_tokens`
- Índices para optimización
- Campos de expiración y tokens

**Cuándo usar**: DESPUÉS de tener la tabla `users` funcionando, si quieres el sistema de reset de contraseña.

**Comando**:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/create-password-reset-table.sql
```

---

### 4. Insertar Usuario de Prueba

**Archivo**: `scripts/insert-test-user.sql`

**Descripción**: Inserta un usuario de prueba en la tabla `users`.

**Incluye**:
- Usuario admin@empresa.com / admin123
- Rol: admin
- Activo: Sí

**Cuándo usar**: Si necesitas insertar más usuarios de prueba después de crear la tabla.

**Comando**:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user.sql
```

---

### 5. Script Simple de Inserción

**Archivo**: `scripts/insert-test-user-simple.sql`

**Descripción**: Versión simplificada de inserción de usuario.

**Cuándo usar**: Si `insert-test-user.sql` falla por alguna razón.

**Comando**:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user-simple.sql
```

---

## Plan de Instalación Recomendado

### Paso 1: Crear tabla users (OBLIGATORIO)
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/users-table.sql
```

Este script incluye ya el usuario admin de prueba.

### Paso 2: (Opcional) Crear tabla de reset de contraseña
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/create-password-reset-table.sql
```

Solo si quieres la funcionalidad de "Olvidar Contraseña".

### Paso 3: (Opcional) Insertar más usuarios de prueba
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user.sql
```

Repite el email o crea uno nuevo.

---

## Comparación de Scripts

| Característica | users-table.sql | setup-users-auth.sql | create-password-reset-table.sql |
|----------------|-----------------|----------------------|--------------------------------|
| Tabla users | ✓ Completa | ✓ Completa | ✗ No |
| Comentarios | ✓ Detallados | ✗ Pocos | ✓ Sí |
| Usuario de prueba | ✓ Incluido | ✓ Incluido | ✗ No |
| Índices | ✓ Optimizados | ✓ Sí | ✓ Sí |
| Auditoría | ✓ Simple | ✓ Tabla separada | ✗ No |
| Procedimientos | ✗ No | ✓ Incluidos | ✗ No |
| Fácil de usar | ✓ Muy fácil | ✗ Complejo | ✓ Fácil |
| Recomendado | ✓ SÍ | ✗ NO | ✓ Para reset |

---

## Verificar Instalación

### Ver estructura de la tabla users:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "DESCRIBE users;"
```

### Ver todos los usuarios:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "SELECT id, email, full_name, role FROM users;"
```

### Ver tablas disponibles:
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "SHOW TABLES;"
```

---

## Scripts Adicionales Disponibles

Además de los anteriores, tienes estos scripts auxiliares:

### verify-database.js
Script Node.js que verifica la conexión a la BD y la estructura de las tablas.

**Comando**:
```bash
node scripts/verify-database.js
```

### test-auth.js
Script Node.js para probar la autenticación.

**Comando**:
```bash
node scripts/test-auth.js
```

---

## Resumen Final

### Necesitas crear tabla users:
➜ Usa: `scripts/users-table.sql` ⭐

### Necesitas reset de contraseña:
➜ Crea tabla: `scripts/create-password-reset-table.sql`

### Necesitas más usuarios de prueba:
➜ Usa: `scripts/insert-test-user.sql`

### Necesitas verificar todo funciona:
➜ Corre: `node scripts/verify-database.js`

---

## Preguntas Frecuentes

**P: ¿Qué script ejecuto primero?**
R: Siempre `scripts/users-table.sql`

**P: ¿Qué pasa si ejecuto todos?**
R: No hay problema, solo puede dar error el segundo si intenta crear tablas que ya existen.

**P: ¿Dónde veo los usuarios?**
R: En la tabla `users` de tu BD con: `SELECT * FROM users;`

**P: ¿Cómo cambio la contraseña de admin?**
R: Debes hashearla con bcrypt primero, luego: `UPDATE users SET password_hash = '...' WHERE email = 'admin@empresa.com';`

**P: ¿Puedo borrar la tabla y empezar de nuevo?**
R: Sí, con: `DROP TABLE users;` Y luego ejecutar el script nuevamente.
