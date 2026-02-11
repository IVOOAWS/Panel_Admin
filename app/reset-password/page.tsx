import type { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña - Delivery Panel',
  description: 'Crea una nueva contraseña para tu cuenta',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
