interface Session {
  userId: string;
  userName: string;
  userRole: string;
  createdAt: number;
}

// Almacenamiento de sesiones en memoria
const sessions = new Map<string, Session>();

// Limpiar sesiones expiradas cada 30 minutos
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.createdAt > 24 * 60 * 60 * 1000) { // 24 horas
      sessions.delete(sessionId);
    }
  }
}, 30 * 60 * 1000);

export function createSession(userId: string, userName: string, userRole: string): string {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  sessions.set(sessionId, {
    userId,
    userName,
    userRole,
    createdAt: Date.now(),
  });
  console.log('[v0] Session created:', sessionId);
  return sessionId;
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }
  
  // Verificar que no esté expirada
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}
