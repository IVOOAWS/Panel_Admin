# Reset de Contraseña - Checklist de Implementación

## Pre-Requisitos
- [x] Base de datos MySQL configurada
- [x] Proyecto Next.js con App Router
- [x] Variables de entorno configuradas (DATABASE_URL)

## Instalación (15 minutos)

### Paso 1: Base de Datos
- [ ] Ejecutar: `mysql ... < scripts/create-password-reset-table.sql`
- [ ] Verificar tablas: `SHOW TABLES LIKE 'password_reset%';`
- [ ] Verificar columnas: `DESCRIBE password_reset_tokens;`

### Paso 2: Revisar Archivos Creados
- [ ] `/lib/password-reset.ts` - Lógica de tokens
- [ ] `/lib/email-service.ts` - Servicio de emails
- [ ] `/app/api/auth/forgot-password/route.ts` - API solicitud
- [ ] `/app/api/auth/reset-password/route.ts` - API reseteo
- [ ] `/app/forgot-password/page.tsx` - Página solicitud
- [ ] `/app/reset-password/page.tsx` - Página reseteo
- [ ] `/components/auth/forgot-password-form.tsx` - Formulario solicitud
- [ ] `/components/auth/reset-password-form.tsx` - Formulario reseteo
- [ ] `/components/auth/login-form.tsx` (modificado) - Enlace agregado

### Paso 3: Configuración de Entorno
- [ ] `.env.local` tiene `DATABASE_URL` configurado
- [ ] `.env.local` tiene `NEXT_PUBLIC_APP_URL` configurado (ej: http://localhost:3000)
- [ ] (Opcional) `.env.local` tiene `RESEND_API_KEY` (para emails reales)
- [ ] (Opcional) `.env.local` tiene `EMAIL_FROM` configurado
- [ ] (Opcional) `.env.local` tiene `SUPPORT_EMAIL` configurado

### Paso 4: Iniciar Servidor
- [ ] Ejecutar: `npm run dev`
- [ ] Servidor escuchando en puerto 3000
- [ ] Sin errores de compilación

## Testing (20 minutos)

### Testing Via Interfaz Web

#### 1. Login
- [ ] Ir a http://localhost:3000/login
- [ ] Ver formulario de login
- [ ] Ver enlace "¿Olvidaste tu contraseña?"

#### 2. Olvidar Contraseña
- [ ] Clic en "¿Olvidaste tu contraseña?"
- [ ] Redirige a /forgot-password
- [ ] Página carga correctamente
- [ ] Hay input para email
- [ ] Hay botón "Enviar Instrucciones"
- [ ] Hay enlace para volver al login

#### 3. Solicitar Reset
- [ ] Ingresar email válido de usuario existente (ej: admin@empresa.com)
- [ ] Clic en "Enviar Instrucciones"
- [ ] Esperar respuesta
- [ ] Ver mensaje de confirmación "Si el email existe..."
- [ ] Revisar consola del servidor para ver token generado
- [ ] Copiar token completo

#### 4. Validación de Token
- [ ] Ir a http://localhost:3000/reset-password?token=TUTOKEN
- [ ] Verificar que la página carga
- [ ] Ver información del usuario
- [ ] Ver campos para nueva contraseña

#### 5. Resetear Contraseña
- [ ] Ingresar nueva contraseña (mínimo 8 caracteres)
- [ ] Confirmar nueva contraseña
- [ ] Validación en tiempo real funciona
- [ ] Ambos campos con contraseña = ✓ verde
- [ ] Campos diferentes = ✗ rojo
- [ ] Clic en "Restablecer Contraseña"
- [ ] Esperar respuesta
- [ ] Ver mensaje de éxito
- [ ] Redirige a /login

#### 6. Login con Nueva Contraseña
- [ ] Ingresar email (admin@empresa.com)
- [ ] Ingresar nueva contraseña (la que acabas de establecer)
- [ ] Clic en "Iniciar Sesión"
- [ ] Conecta exitosamente
- [ ] Redirige a /admin/dashboard

### Testing Via APIs (Curl)

#### 1. Solicitar Reset
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com"}'
```
- [ ] Response: HTTP 200
- [ ] Response contiene: `"success": true`
- [ ] Response contiene: `"message": "..."`

#### 2. Validar Token
```bash
curl "http://localhost:3000/api/auth/reset-password?token=TUTOKEN"
```
- [ ] Response: HTTP 200
- [ ] Response contiene: `"valid": true`
- [ ] Response contiene: `"email": "..."`
- [ ] Response contiene: `"expiresAt": "..."`

#### 3. Resetear Contraseña
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TUTOKEN",
    "newPassword":"NewPassword123!",
    "confirmPassword":"NewPassword123!"
  }'
```
- [ ] Response: HTTP 200
- [ ] Response contiene: `"success": true`
- [ ] Response contiene: `"message": "...actualizada..."`
- [ ] Response contiene: `"redirectTo": "/login"`

### Testing de Seguridad

#### Rate Limiting
- [ ] Solicitar reset 5 veces rápido con mismo email
- [ ] En intento 6: recibir error 429 "Demasiados intentos"
- [ ] Esperar 1 hora o modificar RESET_REQUEST_WINDOW en código

#### Email No Válido
- [ ] Solicitar reset con email: `invalid@example.com`
- [ ] Recibir respuesta: `"Si el email existe..."`
- [ ] No revela que email no existe ✓

#### Token Expirado
- [ ] Generar token
- [ ] Esperar 31 minutos
- [ ] Ir a /reset-password?token=ANTIGUO
- [ ] Ver error: "enlace...expirado"
- [ ] Ofrecer nuevo reset ✓

#### Token Inválido
- [ ] Ir a /reset-password?token=INVALIDO123
- [ ] Ver error: "enlace...inválido"
- [ ] Ofrecer opción de nuevo reset ✓

#### Contraseña Corta
- [ ] En /reset-password
- [ ] Ingresar contraseña: "test" (4 caracteres)
- [ ] Ver validación: "Mínimo 8 caracteres"
- [ ] Botón deshabilitado

#### Contraseñas No Coinciden
- [ ] En /reset-password
- [ ] Campo 1: "Password123!"
- [ ] Campo 2: "Password456!"
- [ ] Ver validación: "Las contraseñas no coinciden"
- [ ] Botón deshabilitado

## Verificación en BD

### Revisar Tablas
```sql
SHOW TABLES LIKE 'password_reset%';
```
- [ ] password_reset_tokens existe
- [ ] password_reset_logs existe

### Revisar Tokens
```sql
SELECT id, user_id, email, created_at, expires_at, used_at 
FROM password_reset_tokens;
```
- [ ] Se crean registros al solicitar reset
- [ ] expires_at es 30 minutos en el futuro
- [ ] used_at es NULL hasta usar el token

### Revisar Logs
```sql
SELECT id, user_id, email, action, status, created_at 
FROM password_reset_logs;
```
- [ ] Se registran los intentos
- [ ] action='request' para solicitudes
- [ ] action='success' para resets exitosos
- [ ] action='failed' para intentos fallidos

## Pruebas de Integración

### Vincular con Servicios de Email

#### Resend (Recomendado)
- [ ] Crear cuenta en https://resend.com
- [ ] Obtener API key
- [ ] Agregar `RESEND_API_KEY=re_xxxxx` a `.env.local`
- [ ] Reiniciar servidor: `npm run dev`
- [ ] Solicitar reset
- [ ] Verificar que email se envía (revisar Resend dashboard)
- [ ] Clic en link del email
- [ ] Reset funciona correctamente

#### SendGrid (Alternativa)
- [ ] Crear cuenta en https://sendgrid.com
- [ ] Obtener API key
- [ ] Agregar `SENDGRID_API_KEY=SG_xxxxx` a `.env.local`
- [ ] Reiniciar servidor
- [ ] Solicitar reset
- [ ] Email enviado correctamente
- [ ] Reset funciona

## Documentación

- [ ] Leer: RESET_PASSWORD_QUICK_START.md
- [ ] Leer: SISTEMA_RESET_CONTRASENA.md
- [ ] Leer: RESET_PASSWORD_FLOWCHART.txt
- [ ] Leer: RESET_PASSWORD_INDEX.md
- [ ] Todos los documentos están en raíz del proyecto

## Código de Producción

### Seguridad
- [ ] DATABASE_URL es segura (no en .env local)
- [ ] API keys configuradas en entorno de producción
- [ ] NEXT_PUBLIC_APP_URL apunta a dominio HTTPS
- [ ] Cookies seguras habilitadas (secure: true)
- [ ] SameSite cookie policy: 'lax'

### Performance
- [ ] Queries optimizadas con índices
- [ ] Rate limiting activo
- [ ] Logs de auditoría activos
- [ ] Emails asíncronos

### Monitoreo
- [ ] Logs de password_reset_logs revisados regularmente
- [ ] Alertas de rate limit configuradas
- [ ] Emails verificados en dashboard de servicio

## Post-Implementación

### Documentación
- [ ] Documentación distribuida a equipo
- [ ] URLs del sistema compartidas
- [ ] Credenciales de prueba comunicadas
- [ ] Instrucciones de troubleshooting disponibles

### Mantenimiento
- [ ] Backup regular de BD configurado
- [ ] Logs archivados periódicamente
- [ ] Tokens expirados limpiados
- [ ] Monitoreo de intentos de reset

### Training
- [ ] Equipo conoce el flujo
- [ ] Soporte sabe manejar problemas comunes
- [ ] Clientes informados del nuevo feature

## Checklist Final

- [ ] Todas las pruebas pasaron
- [ ] Documentación completa
- [ ] Código en producción
- [ ] Monitoreo activo
- [ ] Equipo capacitado
- [ ] LISTO PARA PRODUCCIÓN ✓

## Notas Importantes

### Cambios Realizados
- Base de datos: +2 tablas (password_reset_tokens, password_reset_logs)
- Código: +9 archivos nuevos
- Componentes: 1 modificado (login-form.tsx)
- URLs: +2 nuevas (/forgot-password, /reset-password)
- APIs: +2 endpoints (forgot-password, reset-password)

### Compatibilidad
- Next.js 14+ (App Router)
- React 18+
- MySQL 5.7+
- Node.js 16+

### Dependencias
- bcryptjs (ya incluida)
- crypto (built-in)
- nodemailer (opcional, para emails)

### Conocidos/Limitaciones
- Tokens válidos por 30 minutos (configurable)
- Rate limit 5 intentos/hora (configurable)
- Solo 1 reseteo por token
- Requiere email válido en BD

## Contacto y Soporte

Para problemas:
1. Revisar esta documentación
2. Revisar logs en consola del servidor
3. Revisar password_reset_logs en BD
4. Testear con curl
5. Contactar equipo de desarrollo
