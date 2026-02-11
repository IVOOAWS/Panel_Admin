import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { query } from '@/lib/db';
import { createSession } from '@/lib/sessions-memory';
import { generateBearerToken } from '@/lib/bearer-token';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log('[v0] Login attempt for:', email);
    console.log('[v0] Password provided:', password ? 'yes' : 'no');

    // Validar campos
    if (!email || !password) {
      console.log('[v0] Missing email or password');
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario en la BD
    console.log('[v0] Buscando usuario en BD con email:', email);
    const users = await query(
      'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
      [email]
    );

    console.log('[v0] Query result:', users);
    console.log('[v0] Users array check:', Array.isArray(users), 'Length:', users?.length);

    if (!Array.isArray(users) || users.length === 0) {
      console.log('[v0] Usuario no encontrado:', email);
      console.log('[v0] Por favor, ejecuta: scripts/insert-test-user.sql');
      return NextResponse.json(
        { message: 'Email o contraseña incorrectos - Usuario no encontrado' },
        { status: 401 }
      );
    }

    const user = users[0] as any;
    console.log('[v0] Usuario encontrado:', user.email);

    // Verificar que el usuario esté activo
    if (!user.is_active) {
      console.log('[v0] Usuario inactivo:', email);
      return NextResponse.json(
        { message: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Verificar contraseña
    console.log('[v0] Verificando contraseña...');
    console.log('[v0] Hash almacenado:', user.password_hash?.substring(0, 20) + '...');
    const isPasswordValid = await verifyPassword(password, user.password_hash);
    console.log('[v0] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('[v0] Contraseña incorrecta para:', email);
      console.log('[v0] Password provided:', password);
      console.log('[v0] Expected hash starts with:', user.password_hash?.substring(0, 20));
      return NextResponse.json(
        { message: 'Email o contraseña incorrectos - Contraseña inválida' },
        { status: 401 }
      );
    }

    console.log('[v0] Credenciales válidas para:', email);

    // Generar Bearer token (email:password en base64)
    const bearerToken = generateBearerToken(email, password);
    console.log('[v0] Bearer token generado para:', email);

    // Actualizar último login
    await query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Crear sesión en memoria
    const sessionId = createSession(
      String(user.id),
      user.full_name,
      user.role
    );

    console.log('[v0] Sesión creada para:', email, 'ID:', sessionId);

    // Crear respuesta
    const response = NextResponse.json({
      success: true,
      message: 'Sesión iniciada correctamente',
      sessionId: sessionId,
      bearerToken: bearerToken, // Devolver Bearer token
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
    });

    // Establecer cookie con el ID de sesión
    response.cookies.set('session-id', sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
      secure: process.env.NODE_ENV === 'production' ? true : false,
    });

    // Establecer cookie con el Bearer token (para acceso desde el cliente si es necesario)
    response.cookies.set('bearer-token', bearerToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 horas
      path: '/',
      secure: process.env.NODE_ENV === 'production' ? true : false,
    });

    console.log('[v0] Cookie session-id y bearer-token establecidas');
    console.log('[v0] Respuesta headers Set-Cookie:', response.headers.getSetCookie());

    return response;
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
