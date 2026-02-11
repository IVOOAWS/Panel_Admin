# ⚡ Soluciona tu Error 401 Ahora

Estás recibiendo `Error 401 (Unauthorized)` al intentar hacer login. 

**Tiempo estimado para solucionar:** 5-10 minutos

---

## 🚀 Opción 1: Solución Automática (Recomendado)

### Ejecuta el script de verificación
```bash
node scripts/verify-database.js
```

Este script:
✅ Verifica que MySQL está conectado
✅ Comprueba que la tabla `users` existe
✅ Verifica que hay usuarios en la BD
✅ Te dice exactamente qué necesitas hacer

El output te dirá algo como:
```
✅ Conexión exitosa a MySQL
✅ Tabla "users" existe
❌ NO hay usuarios en la base de datos
   → Ejecuta: scripts/insert-test-user.sql
```

---

## 🔧 Opción 2: Solución Manual

### Si la tabla NO existe
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/setup-users-auth.sql
```

### Si NO hay usuarios
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/insert-test-user.sql
```

### Verificar manualmente
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp
```

Luego en MySQL:
```sql
SHOW TABLES;  -- Ver si existe 'users'
SELECT * FROM users;  -- Ver usuarios
SELECT * FROM users WHERE email = 'admin@empresa.com';  -- Ver admin específico
```

---

## ✅ Después de ejecutar los scripts

1. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```

2. **Intenta login:**
   - Email: `admin@empresa.com`
   - Contraseña: `admin123`

3. **Si funciona:**
   Deberías ver el Dashboard y poder acceder a "Gestionar Usuarios"

4. **Si sigue sin funcionar:**
   Continúa con la siguiente sección

---

## 🔍 Debugging Avanzado

### Ver logs del servidor
En la consola donde ejecutaste `npm run dev`, busca líneas con `[v0]`:

```
[v0] Login attempt for: admin@empresa.com
[v0] Buscando usuario en BD...
[v0] Query result: [...]
[v0] Usuario encontrado: admin@empresa.com
[v0] Password valid: true/false
```

### Test en consola del navegador (F12)
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

Verifica la respuesta en la consola.

---

## 📚 Documentación Adicional

| Archivo | Contenido |
|---------|----------|
| `ERROR_401_SOLUCION.txt` | Guía completa en texto plano |
| `SOLUCIONAR_ERROR_401.md` | Guía detallada con ejemplos |
| `DIAGNOSTICO.md` | Pasos paso a paso de diagnóstico |
| `FLOWCHART_SOLUCION.md` | Árbol de decisiones visual |
| `scripts/verify-database.js` | Script de verificación automática |
| `scripts/test-auth.js` | Script de test de autenticación |

---

## 🎯 Checklist Rápido

- [ ] Ejecuté `node scripts/verify-database.js`
- [ ] Ejecuté los scripts SQL que necesitaba
- [ ] Reinicié el servidor (`npm run dev`)
- [ ] Intento login con `admin@empresa.com` / `admin123`
- [ ] Veo [v0] logs en la consola del servidor
- [ ] El login funciona y veo el Dashboard

---

## 🆘 Contacto/Soporte

Si después de todos estos pasos sigue sin funcionar:

1. Copia los logs de la consola del servidor (líneas con `[v0]`)
2. Verifica que DATABASE_URL en `.env.local` es correcto:
   ```
   DATABASE_URL=mysql://creditivoo_ordersuser:C4ed1t1voo@localhost:3306/creditivoo_ivooApp
   ```
3. Asegúrate de que MySQL está corriendo
4. Verifica que tienes permisos en la BD

---

## 🎉 Una Vez Que Funcione

Después de que el login sea exitoso:

1. **Verás el Dashboard**
2. **Click en "Gestionar Usuarios"** en el sidebar izquierdo
3. **Podrás:**
   - Ver lista de todos los usuarios
   - Crear nuevos usuarios
   - Editar usuarios existentes
   - Eliminar usuarios
   - El Bearer token se genera y guarda automáticamente

¡Tu sistema de autenticación con Bearer tokens está completamente funcional! 🚀

---

## 📖 Siguiente: Sistema de Usuarios Completo

Una vez que el login funcione, explora:
- `docs/API_EXAMPLES.md` - Ejemplos de uso de la API
- `docs/AUTHENTICATION_BEARER.md` - Detalles técnicos del Bearer token
- `README_USUARIOS.md` - Documentación completa del sistema de usuarios

¡Listo para continuar! 🎯
