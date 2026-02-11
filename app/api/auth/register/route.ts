import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    // Validar campos requeridos
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: 'Email, contraseña y nombre son requeridos' },
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

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'El usuario con este email ya existe' },
        { status: 409 }
      );
    }

    // Hashear contraseña
    const passwordHash = await hashPassword(password);

    // Crear nuevo usuario en la BD
    await query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name, role || 'operator']
    );

    console.log('[v0] Usuario creado:', email);

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario creado exitosamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Register error:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}
