import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createPasswordResetToken, getRecentResetAttempts } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email-service';

const RESET_REQUEST_LIMIT = 5; // Máximo de solicitudes
const RESET_REQUEST_WINDOW = 60; // Ventana en minutos

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    console.log('[v0] Password reset request for:', email);

    // Validar campo
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { message: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Email inválido' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting: Verificar intentos recientes
    const recentAttempts = await getRecentResetAttempts(normalizedEmail, RESET_REQUEST_WINDOW);
    if (recentAttempts >= RESET_REQUEST_LIMIT) {
      console.log('[v0] Too many reset requests from:', normalizedEmail);
      return NextResponse.json(
        { 
          message: 'Demasiados intentos. Intenta de nuevo más tarde.',
          waitMinutes: Math.ceil(RESET_REQUEST_WINDOW / recentAttempts)
        },
        { status: 429 }
      );
    }

    // Buscar usuario en la BD
    console.log('[v0] Searching user with email:', normalizedEmail);
    const users = await query(
      'SELECT id, email, full_name FROM users WHERE LOWER(email) = ?',
      [normalizedEmail]
    );

    if (!Array.isArray(users) || users.length === 0) {
      console.log('[v0] User not found:', normalizedEmail);
      // Por seguridad, no revelamos si el email existe o no
      // Pero registramos el intento
      await logResetAttempt(null, normalizedEmail, 'failed', 'Email no encontrado');
      
      // Devolver respuesta genérica (no revelar que el email no existe)
      return NextResponse.json(
        { 
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.' 
        },
        { status: 200 }
      );
    }

    const user = users[0] as any;
    console.log('[v0] User found:', user.email);

    // Generar token de reset
    const resetToken = await createPasswordResetToken(
      user.id,
      user.email,
      req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      req.headers.get('user-agent') || undefined
    );

    if (!resetToken) {
      console.error('[v0] Failed to generate reset token for user:', user.id);
      return NextResponse.json(
        { message: 'Error al generar token de reset. Intenta más tarde.' },
        { status: 500 }
      );
    }

    console.log('[v0] Reset token generated for user:', user.id);

    // Construir reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    // Enviar email
    const emailSent = await sendPasswordResetEmail({
      recipientEmail: user.email,
      recipientName: user.full_name || 'Usuario',
      resetLink: resetLink,
      expiresInMinutes: 30,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
    });

    if (emailSent) {
      console.log('[v0] Password reset email sent to:', user.email);
      await logResetAttempt(user.id, user.email, 'success', 'Email enviado correctamente');
    } else {
      console.error('[v0] Failed to send reset email to:', user.email);
      // Aún así, por seguridad, devolvemos un mensaje genérico al usuario
      await logResetAttempt(user.id, user.email, 'failed', 'Error al enviar email');
    }

    // Respuesta genérica por seguridad
    return NextResponse.json(
      { 
        success: true,
        message: 'Si el email existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña. Por favor revisa tu bandeja de entrada y carpeta de spam.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Password reset request error:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * Registrar intento de reset en log
 */
async function logResetAttempt(
  userId: number | null,
  email: string,
  action: string,
  message: string
) {
  try {
    await query(
      `INSERT INTO password_reset_logs (user_id, email, action, status, error_message)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, email, action, action === 'success' ? 'success' : 'error', message]
    );
  } catch (error) {
    console.error('[v0] Error logging reset attempt:', error);
  }
}
