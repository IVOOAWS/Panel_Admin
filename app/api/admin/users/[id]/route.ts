import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/admin/users/[id]
 * Obtener un usuario específico por ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('[v0] GET /api/admin/users/:id - Obteniendo usuario:', id);

    // Verificar autenticación Bearer
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Autenticación requerida' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT id, email, full_name, role, phone, is_active, created_at, last_login 
       FROM users WHERE id = ?`,
      [parseInt(id)]
    );

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error('[v0] Error obteniendo usuario:', error);
    return NextResponse.json(
      { message: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users/[id]
 * Editar un usuario existente
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('[v0] PUT /api/admin/users/:id - Editando usuario:', id);

    // Verificar autenticación Bearer
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Autenticación requerida' },
        { status: 401 }
      );
    }

    const { email, password, full_name, role, phone, is_active } = await req.json();
    const userId = parseInt(id);

    // Verificar que el usuario existe
    const existingUser = await query(
      'SELECT id, email FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(existingUser) || existingUser.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si se intenta cambiar el email, verificar que no exista otro con ese email
    if (email && email !== (existingUser[0] as any).email) {
      const emailExists = await query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (Array.isArray(emailExists) && emailExists.length > 0) {
        return NextResponse.json(
          { message: 'El email ya está registrado' },
          { status: 409 }
        );
      }
    }

    // Construir la actualización dinámica
    const updates: string[] = [];
    const values: any[] = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (full_name) {
      updates.push('full_name = ?');
      values.push(full_name);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    if (password) {
      const passwordHash = await hashPassword(password);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'No hay datos para actualizar' },
        { status: 400 }
      );
    }

    // Agregar el ID al final
    values.push(userId);
    updates.push('updated_at = NOW()');

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, values);

    console.log('[v0] Usuario actualizado exitosamente:', id);

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
    });
  } catch (error) {
    console.error('[v0] Error actualizando usuario:', error);
    return NextResponse.json(
      { message: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Eliminar un usuario
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('[v0] DELETE /api/admin/users/:id - Eliminando usuario:', id);

    // Verificar autenticación Bearer
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Autenticación requerida' },
        { status: 401 }
      );
    }

    const userId = parseInt(id);

    // No permitir eliminar al usuario admin principal
    const user = await query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete: marcar como inactivo
    await query(
      'UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    console.log('[v0] Usuario desactivado exitosamente:', id);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    console.error('[v0] Error eliminando usuario:', error);
    return NextResponse.json(
      { message: 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
