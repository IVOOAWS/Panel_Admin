/**
 * Servicio de emails para reset de contraseña
 * Usando Nodemailer como backend (configurable)
 */

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  fromName: string;
}

interface PasswordResetEmailData {
  recipientEmail: string;
  recipientName: string;
  resetLink: string;
  expiresInMinutes: number;
  supportEmail: string;
}

/**
 * Generar HTML del email de reset de contraseña
 */
function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const { recipientName, resetLink, expiresInMinutes, supportEmail } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.95; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; color: #1f2937; margin-bottom: 20px; font-weight: 500; }
    .message { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 20px; }
    .button-container { text-align: center; margin: 40px 0; }
    .reset-button { 
      display: inline-block; 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      color: white; 
      padding: 14px 40px; 
      border-radius: 8px; 
      text-decoration: none; 
      font-weight: 600; 
      font-size: 16px; 
      transition: opacity 0.3s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .reset-button:hover { opacity: 0.9; }
    .link-text { font-size: 12px; color: #9ca3af; word-break: break-all; margin-top: 15px; font-family: monospace; }
    .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 6px; }
    .warning p { margin: 0; font-size: 13px; color: #92400e; }
    .security-list { background-color: #f0fdf4; border: 1px solid #dcfce7; padding: 15px 15px 15px 30px; margin: 20px 0; border-radius: 6px; }
    .security-list p { margin: 0 0 10px 0; font-size: 13px; color: #166534; }
    .security-list li { font-size: 13px; color: #166534; margin-bottom: 6px; }
    .footer { background-color: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 8px 0; font-size: 12px; color: #9ca3af; }
    .footer-link { color: #10b981; text-decoration: none; font-weight: 600; }
    .expiration { font-weight: 600; color: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Restablecer Contraseña</h1>
      <p>Panel de Administración</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hola <strong>${escapeHtml(recipientName)}</strong>,</p>

      <p class="message">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no solicitaste esto, puedes ignorar este correo de forma segura.
      </p>

      <p class="message">
        Para restablecer tu contraseña, haz clic en el botón de abajo:
      </p>

      <div class="button-container">
        <a href="${escapeHtml(resetLink)}" class="reset-button">Restablecer Contraseña</a>
        <p class="link-text">
          O copia y pega este enlace en tu navegador:<br>
          ${escapeHtml(resetLink)}
        </p>
      </div>

      <div class="warning">
        <p><strong>⏱️ Este enlace expira en ${expiresInMinutes} minutos.</strong> Después de este tiempo, deberás solicitar un nuevo enlace de reset.</p>
      </div>

      <div class="security-list">
        <p><strong>Por tu seguridad:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>No compartas este enlace con nadie</li>
          <li>Nunca compartiremos tu contraseña</li>
          <li>El enlace solo funciona una sola vez</li>
          <li>Usa una contraseña fuerte y única</li>
        </ul>
      </div>

      <p class="message">
        ¿Problemas con el botón? Si no funciona, copia el enlace anterior y pégalo en tu navegador.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>© ${new Date().getFullYear()} Panel Delivery</strong></p>
      <p>¿Preguntas o problemas? <a href="mailto:${escapeHtml(supportEmail)}" class="footer-link">Contáctanos aquí</a></p>
      <p style="color: #d1d5db; font-size: 11px; margin-top: 15px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generar texto plano del email
 */
function generatePasswordResetEmailText(data: PasswordResetEmailData): string {
  const { recipientName, resetLink, expiresInMinutes, supportEmail } = data;

  return `
Restablecer Contraseña

Hola ${recipientName},

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no solicitaste esto, puedes ignorar este correo de forma segura.

Para restablecer tu contraseña, haz clic en el siguiente enlace:
${resetLink}

IMPORTANTE:
- Este enlace expira en ${expiresInMinutes} minutos
- No compartas este enlace con nadie
- El enlace solo funciona una sola vez
- Usa una contraseña fuerte y única

Si el enlace anterior no funciona, cópialo y pégalo en tu navegador.

¿Problemas o preguntas? Contacta a: ${supportEmail}

---
© ${new Date().getFullYear()} Panel Delivery
Este es un correo automático, por favor no respondas a este mensaje.
  `;
}

/**
 * Escapar HTML para prevenir inyección
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Enviar email de reset de contraseña (stub para implementación)
 * 
 * Nota: Esta es una implementación base. Para producción, necesitas:
 * - SendGrid (recomendado)
 * - Resend (para desarrollo/testing)
 * - AWS SES
 * - Nodemailer
 */
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData
): Promise<boolean> {
  try {
    console.log('[v0] Enviando email de reset a:', data.recipientEmail);

    // Opción 1: Usar Resend (recomendado para desarrollo)
    const hasResendKey = process.env.RESEND_API_KEY;
    if (hasResendKey) {
      return await sendViaResend(data);
    }

    // Opción 2: Usar SendGrid
    const hasSendGridKey = process.env.SENDGRID_API_KEY;
    if (hasSendGridKey) {
      return await sendViaSendGrid(data);
    }

    // Opción 3: Usar Nodemailer (desarrollo local)
    const hasEmailConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER;
    if (hasEmailConfig) {
      return await sendViaNodemailer(data);
    }

    // Fallback: Loguear y simular envío (para desarrollo sin email configurado)
    console.log('[v0] No hay servicio de email configurado. Mostrando contenido que se enviaría:');
    console.log('[v0] Para:', data.recipientEmail);
    console.log('[v0] Reset Link:', data.resetLink);
    return true;
  } catch (error) {
    console.error('[v0] Error sending password reset email:', error);
    return false;
  }
}

/**
 * Enviar via Resend (https://resend.com)
 */
async function sendViaResend(data: PasswordResetEmailData): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'noreply@example.com',
        to: data.recipientEmail,
        subject: 'Restablecer tu contraseña',
        html: generatePasswordResetEmailHTML(data),
        text: generatePasswordResetEmailText(data),
      }),
    });

    if (response.ok) {
      console.log('[v0] Email enviado via Resend');
      return true;
    }

    console.error('[v0] Error sending via Resend:', await response.text());
    return false;
  } catch (error) {
    console.error('[v0] Error with Resend:', error);
    return false;
  }
}

/**
 * Enviar via SendGrid (https://sendgrid.com)
 */
async function sendViaSendGrid(data: PasswordResetEmailData): Promise<boolean> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: data.recipientEmail, name: data.recipientName }],
            subject: 'Restablecer tu contraseña',
          },
        ],
        from: {
          email: process.env.EMAIL_FROM || 'noreply@example.com',
          name: process.env.EMAIL_FROM_NAME || 'Panel Admin',
        },
        content: [
          {
            type: 'text/html',
            value: generatePasswordResetEmailHTML(data),
          },
          {
            type: 'text/plain',
            value: generatePasswordResetEmailText(data),
          },
        ],
      }),
    });

    if (response.ok) {
      console.log('[v0] Email enviado via SendGrid');
      return true;
    }

    console.error('[v0] Error sending via SendGrid:', await response.text());
    return false;
  } catch (error) {
    console.error('[v0] Error with SendGrid:', error);
    return false;
  }
}

/**
 * Enviar via Nodemailer (para desarrollo local)
 */
async function sendViaNodemailer(data: PasswordResetEmailData): Promise<boolean> {
  try {
    console.log('[v0] Intentando enviar email via Nodemailer...');
    console.log('[v0] Email config - Host:', process.env.EMAIL_HOST);
    console.log('[v0] Email config - User:', process.env.EMAIL_USER);
    
    // Importar nodemailer dinámicamente
    const nodemailer = await import('nodemailer');

    console.log('[v0] Creando transporter con Nodemailer...');
    
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false, // true para 465, false para 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    console.log('[v0] Verificando conexión SMTP...');
    await transporter.verify();
    console.log('[v0] Conexión SMTP verificada exitosamente');

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: data.recipientEmail,
      subject: 'Restablecer tu contraseña - IVOO Panel Admin',
      html: generatePasswordResetEmailHTML(data),
      text: generatePasswordResetEmailText(data),
    };

    console.log('[v0] Enviando email a:', data.recipientEmail);
    const info = await transporter.sendMail(mailOptions);
    console.log('[v0] ✓ Email enviado exitosamente via Nodemailer:', info.messageId);
    return true;
  } catch (error) {
    console.error('[v0] ✗ Error con Nodemailer:', error);
    return false;
  }
}
