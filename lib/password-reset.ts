import crypto from 'crypto';
import { query } from './db';

export interface ResetTokenData {
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Genera un token seguro para reset de contraseña
 */
export function generateResetToken(): { token: string; hash: string } {
  // Generar token aleatorio de 32 bytes (256 bits)
  const token = crypto.randomBytes(32).toString('hex');
  
  // Crear hash del token usando SHA-256
  const hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  return { token, hash };
}

/**
 * Crear un registro de reset de contraseña
 */
export async function createPasswordResetToken(
  userId: number,
  userEmail: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string | null> {
  try {
    const { token, hash } = generateResetToken();
    
    // Expiración: 30 minutos desde ahora
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // Insertar en la BD
    await query(
      `INSERT INTO password_reset_tokens 
       (user_id, token, token_hash, email, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, token, hash, userEmail, expiresAt, ipAddress || null, userAgent || null]
    );

    // Registrar en log
    await logPasswordReset(userId, userEmail, 'request', 'pending', null, ipAddress);

    return token;
  } catch (error) {
    console.error('[v0] Error creating password reset token:', error);
    return null;
  }
}

/**
 * Verificar y obtener información del token
 */
export async function verifyResetToken(token: string): Promise<any | null> {
  try {
    if (!token) return null;

    // Crear hash del token proporcionado
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar en la BD
    const result = await query(
      `SELECT prt.*, u.email, u.id as user_id, u.full_name 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token_hash = ? AND prt.used_at IS NULL`,
      [tokenHash]
    );

    if (!Array.isArray(result) || result.length === 0) {
      console.log('[v0] Token no encontrado o ya fue utilizado');
      return null;
    }

    const resetRecord = result[0] as any;

    // Verificar que no haya expirado
    const now = new Date();
    const expiresAt = new Date(resetRecord.expires_at);

    if (now > expiresAt) {
      console.log('[v0] Token expirado');
      // Marcar como usado (para que no se pueda intentar nuevamente)
      await query(
        `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`,
        [resetRecord.id]
      );
      return null;
    }

    return {
      userId: resetRecord.user_id,
      email: resetRecord.email,
      fullName: resetRecord.full_name,
      tokenId: resetRecord.id,
      expiresAt: expiresAt,
    };
  } catch (error) {
    console.error('[v0] Error verifying reset token:', error);
    return null;
  }
}

/**
 * Actualizar la contraseña del usuario
 */
export async function updateUserPassword(
  userId: number,
  newPasswordHash: string,
  tokenId: number
): Promise<boolean> {
  try {
    // Actualizar contraseña
    await query(
      `UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`,
      [newPasswordHash, userId]
    );

    // Marcar token como usado
    await query(
      `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?`,
      [tokenId]
    );

    // Registrar en log
    await logPasswordReset(userId, null, 'success', 'success', null);

    return true;
  } catch (error) {
    console.error('[v0] Error updating user password:', error);
    return false;
  }
}

/**
 * Limpiar tokens expirados
 */
export async function cleanExpiredResetTokens(): Promise<number> {
  try {
    const result = await query(
      `UPDATE password_reset_tokens 
       SET used_at = NOW() 
       WHERE used_at IS NULL AND expires_at < NOW()`
    );

    console.log('[v0] Cleaned expired reset tokens');
    return 0;
  } catch (error) {
    console.error('[v0] Error cleaning expired tokens:', error);
    return 0;
  }
}

/**
 * Registrar intento de reset en log
 */
async function logPasswordReset(
  userId: number | null,
  email: string | null,
  action: string,
  status: string,
  errorMessage: string | null,
  ipAddress?: string
) {
  try {
    await query(
      `INSERT INTO password_reset_logs (user_id, email, action, status, error_message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email, action, status, errorMessage, ipAddress || null]
    );
  } catch (error) {
    console.error('[v0] Error logging password reset:', error);
  }
}

/**
 * Obtener intentos recientes de reset para un email (para rate limiting)
 */
export async function getRecentResetAttempts(
  email: string,
  minutesBack: number = 60
): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM password_reset_logs 
       WHERE email = ? AND action = 'request' AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [email, minutesBack]
    );

    if (Array.isArray(result) && result.length > 0) {
      return (result[0] as any).count || 0;
    }
    return 0;
  } catch (error) {
    console.error('[v0] Error getting recent reset attempts:', error);
    return 0;
  }
}
