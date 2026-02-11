import * as crypto from 'crypto';
import { hashPassword, verifyPassword } from './auth';

/**
 * Genera un Bearer token a partir de usuario y contraseña encriptados
 * Formato: "Bearer base64(email:password_hash)"
 */
export function generateBearerToken(email: string, password: string): string {
  const credentials = `${email}:${password}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Bearer ${encoded}`;
}

/**
 * Extrae las credenciales del Bearer token
 */
export function extractBearerCredentials(
  bearerToken: string
): { email: string; password: string } | null {
  try {
    // Remover "Bearer " del inicio
    if (!bearerToken.startsWith('Bearer ')) {
      return null;
    }

    const encoded = bearerToken.substring(7);
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [email, password] = decoded.split(':');

    if (!email || !password) {
      return null;
    }

    return { email, password };
  } catch (error) {
    console.error('[v0] Error extrayendo credenciales Bearer:', error);
    return null;
  }
}

/**
 * Crea un token API encriptado para almacenar en la base de datos
 * Este es más seguro que almacenar el token en texto plano
 */
export function createEncryptedApiToken(email: string, password: string): string {
  const secret = process.env.API_SECRET_KEY || 'default-secret-key';
  const timestamp = Date.now().toString();
  const data = `${email}:${password}:${timestamp}`;

  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return encrypted;
}

/**
 * Desencripta y verifica el token API
 */
export function decryptApiToken(
  encryptedToken: string
): { email: string; password: string; timestamp: number } | null {
  try {
    const secret = process.env.API_SECRET_KEY || 'default-secret-key';
    const decipher = crypto.createDecipher('aes-256-cbc', secret);
    let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const [email, password, timestamp] = decrypted.split(':');

    return { email, password, timestamp: parseInt(timestamp) };
  } catch (error) {
    console.error('[v0] Error desencriptando token API:', error);
    return null;
  }
}

/**
 * Verifica si un Bearer token es válido comparando con credenciales almacenadas
 */
export async function verifyBearerToken(
  bearerToken: string,
  storedPasswordHash: string
): Promise<boolean> {
  const credentials = extractBearerCredentials(bearerToken);
  if (!credentials) return false;

  // Verificar la contraseña contra el hash almacenado
  return verifyPassword(credentials.password, storedPasswordHash);
}
