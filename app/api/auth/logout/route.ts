import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Sesión cerrada' });
    const session = await getIronSession(req.cookies, response.cookies, sessionOptions);
    session.destroy();

    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { message: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
