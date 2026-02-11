import * as crypto from 'crypto';

const secret = process.env.API_SECRET_KEY;

interface SessionPayload {
  userId: string;
  userName: string;
  userRole: string;
  iat: number;
}

export function createSessionToken(payload: Omit<SessionPayload, 'iat'>): string {
  const data: SessionPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
  };

  // Simple JWT-like token (header.payload.signature)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(data)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    
    // Verificar firma
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decodificar payload
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;

    // Verificar que el token no tenga más de 24 horas
    const maxAge = 24 * 60 * 60;
    if (Math.floor(Date.now() / 1000) - payload.iat > maxAge) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('[v0] Token verification error:', error);
    return null;
  }
}
