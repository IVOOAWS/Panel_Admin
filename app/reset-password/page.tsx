import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/reset-password-form';
import { Loader } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Restablecer Contraseña - Delivery Panel',
  description: 'Crea una nueva contraseña para tu cuenta',
};

// Componente opcional para mostrar mientras carga el formulario
function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 text-green-600 animate-spin" />
        <p className="text-slate-700">Cargando...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}