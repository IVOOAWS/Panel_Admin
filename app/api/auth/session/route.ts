import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions-memory';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.cookies.get('session-id')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      );
    }

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { message: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      userId: session.userId,
      userName: session.userName,
      userRole: session.userRole,
    });
  } catch (error) {
    console.error('[v0] Session error:', error);
    return NextResponse.json(
      { message: 'Error al obtener sesión' },
      { status: 500 }
    );
  }
}
