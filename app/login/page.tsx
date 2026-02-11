import type { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Login - Delivery Panel',
  description: 'Inicia sesión en el panel de gestión de entregas',
};

export default function LoginPage() {
  return <LoginForm />;
}
