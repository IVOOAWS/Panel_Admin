import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { verifyBearerToken } from '@/lib/bearer-token';

/**
 * GET /api/admin/users
 * Obtener lista de todos los usuarios (requiere autenticación Bearer)
 */
export async function GET(req: NextRequest) {
  try {
    console.log('[v0] GET /api/admin/users - Intentando listar usuarios');

    // Verificar autenticación Bearer
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[v0] No Bearer token provided');
      return NextResponse.json(
        { message: 'Autenticación requerida. Usa Bearer token' },
        { status: 401 }
      );
    }

    // Validar el Bearer token
    const bearerToken = authHeader.substring(7);
    const [email] = bearerToken.includes(':')
      ? Buffer.from(bearerToken, 'base64').toString().split(':')
      : [null];

    if (!email) {
      return NextResponse.json(
        { message: 'Bearer token inválido' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea admin
    const adminUser = await query(
      'SELECT id, role FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(adminUser) || adminUser.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const admin = (adminUser as any[])[0];
    if (admin.role !== 'admin') {
      return NextResponse.json(
        { message: 'Solo administradores pueden listar usuarios' },
        { status: 403 }
      );
    }

    // Obtener todos los usuarios
    const users = await query(
      `SELECT id, email, full_name, role, phone, is_active, created_at, last_login 
       FROM users ORDER BY created_at DESC`
    );

    console.log('[v0] Usuarios listados exitosamente');
    return NextResponse.json({
      success: true,
      data: users,
      count: Array.isArray(users) ? users.length : 0,
    });
  } catch (error) {
    console.error('[v0] Error en GET usuarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Crear nuevo usuario (requiere autenticación Bearer)
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[v0] POST /api/admin/users - Crear nuevo usuario');

    // Verificar autenticación Bearer
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Autenticación requerida. Usa Bearer token' },
        { status: 401 }
      );
    }

    const { email, password, full_name, role, phone } = await req.json();

    // Validar campos requeridos
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { message: 'Email, contraseña y nombre completo son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el rol sea válido
    const validRoles = ['admin', 'operator', 'driver', 'support'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Verificar que no exista el email
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Encriptar contraseña
    const passwordHash = await hashPassword(password);

    // Crear usuario
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [email, passwordHash, full_name, role, phone || null]
    );

    console.log('[v0] Usuario creado exitosamente:', email);

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: (result as any).insertId,
        email,
        full_name,
        role,
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error('[v0] Error creando usuario:', error);
    return NextResponse.json(
      { message: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
