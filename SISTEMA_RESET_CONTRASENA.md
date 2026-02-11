# Sistema de Reset de Contraseña - Documentación Completa

## Resumen

Se ha implementado un sistema completo y seguro de reset/recuperación de contraseña con:

- Página de "Olvidar Contraseña"
- Validación de emails
- Tokens con expiración de 30 minutos
- Envío de correos HTML estructurados
- Página de reset con validación en tiempo real
- Rate limiting para prevenir abuso
- Logs de auditoría

## Componentes Implementados

### 1. Base de Datos

#### Tabla: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tabla: `password_reset_logs`
```sql
CREATE TABLE password_reset_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  email VARCHAR(255),
  action VARCHAR(50), -- 'request', 'success', 'failed', 'expired'
  status VARCHAR(20), -- 'pending', 'success', 'error'
  error_message TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### 2. Librerías

#### `/lib/password-reset.ts`
Funciones principales:
- `generateResetToken()` - Genera token aleatorio + hash SHA-256
- `createPasswordResetToken()` - Crea registro de reset en BD
- `verifyResetToken()` - Valida token y verifica expiración
- `updateUserPassword()` - Actualiza contraseña y marca token como usado
- `cleanExpiredResetTokens()` - Limpia tokens vencidos
- `getRecentResetAttempts()` - Rate limiting

#### `/lib/email-service.ts`
Funciones principales:
- `sendPasswordResetEmail()` - Envía email (multi-proveedor)
- `sendViaResend()` - Envía via Resend (recomendado)
- `sendViaSendGrid()` - Envía via SendGrid
- `generatePasswordResetEmailHTML()` - HTML del email
- `generatePasswordResetEmailText()` - Texto plano del email

### 3. APIs

#### `POST /api/auth/forgot-password`
Solicita reset de contraseña

**Request:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás instrucciones..."
}
```

**Response (Rate Limited):**
```json
{
  "message": "Demasiados intentos. Intenta de nuevo más tarde.",
  "waitMinutes": 12
}
```

**Features:**
- Validación de email
- Rate limiting: máximo 5 intentos por hora
- Respuesta genérica por seguridad (no revela si email existe)
- Registra intentos en log
- Envía email HTML estructurado

#### `GET /api/auth/reset-password?token={token}`
Valida token sin resetear contraseña

**Response (Valid):**
```json
{
  "valid": true,
  "email": "usuario@example.com",
  "fullName": "Juan Pérez",
  "expiresAt": "2024-02-10T15:30:00Z",
  "message": "Token válido"
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "El enlace de reset es inválido o ha expirado..."
}
```

#### `POST /api/auth/reset-password`
Resetea la contraseña

**Request:**
```json
{
  "token": "abc123...",
  "newPassword": "NuevaContraseña123!",
  "confirmPassword": "NuevaContraseña123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Tu contraseña ha sido actualizada correctamente...",
  "redirectTo": "/login"
}
```

**Validaciones:**
- Token válido y no expirado
- Contraseñas coinciden
- Mínimo 8 caracteres
- Máximo 128 caracteres
- Hash SHA-256 para seguridad

## Flujo de Usuario

### 1. Olvidé mi Contraseña
1. Usuario hace clic en "¿Olvidaste tu contraseña?" en login
2. Va a `/forgot-password`
3. Ingresa su email
4. Envía formulario

### 2. Validación y Envío
1. Backend valida email
2. Busca usuario en BD
3. Genera token + hash SHA-256
4. Crea registro con expiración 30min
5. Envía email con link: `https://app.com/reset-password?token=ABC123`
6. Registra intento en log

### 3. Recibe Email
- Email HTML profesional
- Botón "Restablecer Contraseña"
- Link directo en texto
- Advertencia de expiración 30min
- Consejos de seguridad

### 4. Resetea Contraseña
1. Usuario hace clic en link
2. Va a `/reset-password?token=ABC123`
3. Frontend valida token con GET
4. Muestra formulario si válido
5. Usuario ingresa nueva contraseña
6. Confirma contraseña
7. Envía formulario

### 5. Actualiza Contraseña
1. Backend verifica token
2. Valida contraseña
3. Hashea con bcrypt
4. Actualiza en BD
5. Marca token como usado
6. Redirige a login

## Configuración de Servicios de Email

### Opción 1: Resend (Recomendado)

**Variables de entorno:**
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://app.com
EMAIL_FROM=noreply@app.com
EMAIL_FROM_NAME=Mi Aplicación
SUPPORT_EMAIL=support@app.com
```

**Setup:**
1. Ve a https://resend.com
2. Crea cuenta gratis
3. Obtén API key
4. Agrégala a `.env.local`

**Ventajas:**
- Gratis para desarrollo
- Fácil de configurar
- Excelente para emails transaccionales
- No requiere SMTP

### Opción 2: SendGrid

**Variables de entorno:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@app.com
EMAIL_FROM_NAME=Mi Aplicación
```

**Setup:**
1. Ve a https://sendgrid.com
2. Crea cuenta
3. Obtén API key
4. Agrégala a `.env.local`

### Opción 3: Nodemailer (Local)

Para desarrollo sin servicio externo, usa Nodemailer con SMTP local.

## Seguridad

### Medidas Implementadas

1. **Tokens Seguros**
   - Aleatorios de 32 bytes (256 bits)
   - Hash SHA-256 almacenado en BD
   - No el token en texto plano

2. **Expiración**
   - 30 minutos de duración
   - Verificación en cada uso
   - Token marcado como "usado"

3. **Rate Limiting**
   - Máximo 5 intentos por hora
   - Por email
   - Previene brute force

4. **Respuestas Genéricas**
   - No revela si email existe
   - Previene enumeración de usuarios
   - Mensajes seguros en JSON

5. **HTTPS Required**
   - Links deben ser HTTPS
   - Cookies seguras
   - SameSite y HttpOnly

6. **Password Hashing**
   - Bcrypt con salt
   - No almacena contraseñas en texto plano
   - Verificación segura

7. **Logs de Auditoría**
   - Todos los intentos registrados
   - IP address capturada
   - User agent registrado
   - Histórico completo

## Archivo SQL para Ejecutar

Copia y pega en tu MySQL:

```bash
mysql -h localhost -u user -p database < scripts/create-password-reset-table.sql
```

O ejecuta manualmente:

```sql
-- Crear tablas
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS password_reset_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  email VARCHAR(255),
  action VARCHAR(50),
  status VARCHAR(20),
  error_message TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_user_id (user_id)
);
```

## Archivos Creados

```
/scripts/create-password-reset-table.sql       - Script SQL
/lib/password-reset.ts                         - Lógica de tokens
/lib/email-service.ts                          - Servicio de emails
/app/api/auth/forgot-password/route.ts         - API solicitud reset
/app/api/auth/reset-password/route.ts          - API resetear contraseña
/app/forgot-password/page.tsx                  - Página olvidar contraseña
/app/reset-password/page.tsx                   - Página resetear contraseña
/components/auth/forgot-password-form.tsx      - Formulario solicitud
/components/auth/reset-password-form.tsx       - Formulario reset
```

## Testing

### Prueba Manual

1. **Solicitar Reset**
   ```bash
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com"}'
   ```

2. **Validar Token**
   ```bash
   curl "http://localhost:3000/api/auth/reset-password?token=ABC123..."
   ```

3. **Resetear Contraseña**
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{
       "token":"ABC123...",
       "newPassword":"NewPass123!",
       "confirmPassword":"NewPass123!"
     }'
   ```

### Verificar Logs

```sql
SELECT * FROM password_reset_logs ORDER BY created_at DESC LIMIT 10;
SELECT * FROM password_reset_tokens WHERE expires_at > NOW();
```

## Próximos Pasos

1. Ejecuta el script SQL: `scripts/create-password-reset-table.sql`
2. Configura variables de entorno:
   - `RESEND_API_KEY` (opcional, para emails)
   - `NEXT_PUBLIC_APP_URL` (tu dominio)
3. Reinicia servidor: `npm run dev`
4. Prueba: Login → "¿Olvidaste tu contraseña?"

## Soporte

Para cambios o mejoras:
- Edita `/lib/password-reset.ts` para lógica
- Edita `/lib/email-service.ts` para emails
- Edita componentes en `/components/auth/` para UI
