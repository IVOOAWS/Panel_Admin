# Reset de Contraseña - Guía Rápida

## Instalación en 5 minutos

### 1. Ejecuta el Script SQL

```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp < scripts/create-password-reset-table.sql
```

**Verifica que se crearon las tablas:**
```bash
mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp -e "SHOW TABLES LIKE 'password_reset%';"
```

### 2. Configura Variables de Entorno (Opcional)

Si quieres que funcione el envío de emails, agrega a `.env.local`:

**Para Resend (Recomendado):**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_FROM=noreply@app.com
SUPPORT_EMAIL=support@app.com
```

Obtén tu API key gratis en: https://resend.com

### 3. Reinicia el Servidor

```bash
npm run dev
```

### 4. Prueba

1. Ve a http://localhost:3000/login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa un email válido
4. Si configuraste emails, recibirás un correo
5. Si no, verifica la consola del servidor para ver el token

## URLs Disponibles

- Olvidar contraseña: `http://localhost:3000/forgot-password`
- Resetear contraseña: `http://localhost:3000/reset-password?token=ABC123`

## APIs

### 1. Solicitar Reset
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

### 2. Validar Token
```bash
GET /api/auth/reset-password?token=ABC123
```

### 3. Resetear Contraseña
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "ABC123",
  "newPassword": "NuevaContraseña123!",
  "confirmPassword": "NuevaContraseña123!"
}
```

## Características

✓ Olvidar contraseña
✓ Validación de email
✓ Tokens con expiración 30 minutos
✓ Emails HTML (opcional)
✓ Rate limiting
✓ Logs de auditoría
✓ Respuestas seguras
✓ UI profesional con Framer Motion

## Seguridad

- Tokens SHA-256
- Bcrypt para contraseñas
- Expiración 30 minutos
- Rate limiting 5/hora
- IP tracking
- Logs de auditoría
- HTTPS ready

## Si No Configuras Emails

El sistema funcionará igual pero:
- Los emails se mostrarán en la consola del servidor
- No se enviarán emails reales
- Los tokens seguirán siendo válidos
- Puedes ver los tokens en los logs

## Verificar en BD

```sql
-- Ver intentos de reset
SELECT * FROM password_reset_logs ORDER BY created_at DESC;

-- Ver tokens activos
SELECT * FROM password_reset_tokens WHERE used_at IS NULL;

-- Ver tokens expirados
SELECT * FROM password_reset_tokens WHERE expires_at < NOW();
```

## Troubleshooting

### Error: "Table doesn't exist"
- Ejecuta el script SQL
- Verifica que ejecutaste el comando correcto
- Verifica permiso de usuario MySQL

### Emails no se envían
- No configuraste `RESEND_API_KEY`
- Es normal, revisa console del servidor
- Configura en https://resend.com

### Token expirado
- El token dura 30 minutos
- Solicita uno nuevo en "Olvidar contraseña"
- Cada token solo se puede usar una vez

### Contraseña muy corta
- Mínimo 8 caracteres
- Máximo 128 caracteres
- Usa mayúsculas, minúsculas, números

## Próximos Pasos Opcionales

1. **Personalizar emails** - Edita `/lib/email-service.ts`
2. **Cambiar expiración** - Edita `/lib/password-reset.ts` (línea 33)
3. **Aumentar rate limit** - Edita `/app/api/auth/forgot-password/route.ts`
4. **Agregar 2FA** - Contacta al equipo de desarrollo

## Documentación Completa

Ve a `SISTEMA_RESET_CONTRASENA.md` para documentación detallada.
