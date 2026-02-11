import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Olvidar Contraseña - Delivery Panel',
  description: 'Restablece tu contraseña del panel de gestión',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
