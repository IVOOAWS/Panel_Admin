import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/sessions-memory';

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get('session-id')?.value;
  
  console.log('[v0] Verify endpoint - SessionId from cookie:', sessionId);
  
  if (!sessionId) {
    console.log('[v0] Verify endpoint - No session ID found');
    return NextResponse.json({
      authenticated: false,
      message: 'No session found',
    });
  }
  
  const session = getSession(sessionId);
  
  if (!session) {
    console.log('[v0] Verify endpoint - Invalid/expired session');
    return NextResponse.json({
      authenticated: false,
      message: 'Invalid or expired session',
    });
  }
  
  console.log('[v0] Verify endpoint - Valid session for user:', session.userId);
  
  return NextResponse.json({
    authenticated: true,
    session,
  });
}
