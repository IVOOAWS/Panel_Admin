import { SessionOptions } from 'iron-session';

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production-minimum-32-characters-for-testing',
  cookieName: 'delivery-panel-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 horas
  },
};

export interface SessionData {
  userId?: string;
  userName?: string;
  userRole?: string;
  isLoggedIn?: boolean;
}
