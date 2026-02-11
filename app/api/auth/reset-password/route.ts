import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken, updateUserPassword } from '@/lib/password-reset';
import { hashPassword } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await req.json();
    console.log('[v0] Password reset attempt with token');

    // Validar campos
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: 'Token, contraseña y confirmación son requeridos' },
        { status: 400 }
      );
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: 'Las contraseñas no coinciden' },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Validar que no sea demasiado larga
    if (newPassword.length > 128) {
      return NextResponse.json(
        { message: 'La contraseña es demasiado larga' },
        { status: 400 }
      );
    }

    console.log('[v0] Verifying reset token...');

    // Verificar token
    const tokenData = await verifyResetToken(token);

    if (!tokenData) {
      console.log('[v0] Invalid or expired token');
      return NextResponse.json(
        { message: 'El enlace de reset es inválido o ha expirado. Solicita uno nuevo.' },
        { status: 401 }
      );
    }

    console.log('[v0] Token valid for user:', tokenData.userId);

    // Hashear nueva contraseña
    console.log('[v0] Hashing new password...');
    const passwordHash = await hashPassword(newPassword);

    // Actualizar contraseña
    console.log('[v0] Updating password for user:', tokenData.userId);
    const updateSuccess = await updateUserPassword(
      tokenData.userId,
      passwordHash,
      tokenData.tokenId
    );

    if (!updateSuccess) {
      console.error('[v0] Failed to update password');
      return NextResponse.json(
        { message: 'Error al actualizar la contraseña. Intenta más tarde.' },
        { status: 500 }
      );
    }

    console.log('[v0] Password updated successfully for user:', tokenData.userId);

    // Registrar en log
    await logPasswordChange(tokenData.userId, 'success', 'Contraseña actualizada vía reset');

    return NextResponse.json(
      {
        success: true,
        message: 'Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar sesión.',
        redirectTo: '/login'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Password reset error:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * GET - Validar token sin resetear contraseña (para verificación previa)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    console.log('[v0] Validating reset token...');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    const tokenData = await verifyResetToken(token);

    if (!tokenData) {
      console.log('[v0] Invalid or expired token');
      return NextResponse.json(
        {
          valid: false,
          message: 'El enlace de reset es inválido o ha expirado. Solicita uno nuevo.',
        },
        { status: 200 }
      );
    }

    console.log('[v0] Token is valid, expires at:', tokenData.expiresAt);

    return NextResponse.json(
      {
        valid: true,
        email: tokenData.email,
        fullName: tokenData.fullName,
        expiresAt: tokenData.expiresAt,
        message: 'Token válido',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Token validation error:', error);
    return NextResponse.json(
      { valid: false, message: 'Error al validar el token' },
      { status: 500 }
    );
  }
}

/**
 * Registrar cambio de contraseña
 */
async function logPasswordChange(
  userId: number,
  status: string,
  message: string
) {
  try {
    await query(
      `INSERT INTO password_reset_logs (user_id, action, status, error_message)
       VALUES (?, ?, ?, ?)`,
      [userId, 'reset_success', status, message]
    );
  } catch (error) {
    console.error('[v0] Error logging password change:', error);
  }
}
