'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const containerVariants = {
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
  },
};

interface TokenData {
  valid: boolean;
  email?: string;
  fullName?: string;
  expiresAt?: string;
  message?: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Validar token al cargar
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenData({ valid: false, message: 'No hay token proporcionado' });
        setValidating(false);
        return;
      }

      try {
        console.log('[v0] Validating reset token...');
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data: TokenData = await res.json();

        console.log('[v0] Token validation response:', data);

        if (data.valid) {
          setTokenValid(true);
          setTokenData(data);
        } else {
          setTokenValid(false);
          setTokenData(data);
        }
      } catch (err) {
        console.error('[v0] Token validation error:', err);
        setTokenValid(false);
        setTokenData({ valid: false, message: 'Error al validar el token' });
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Validar que las contraseñas coincidan
  const passwordsMatch = newPassword === confirmPassword;
  const passwordValid = newPassword.length >= 8;
  const canSubmit = passwordValid && passwordsMatch && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!passwordValid) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      console.log('[v0] Submitting password reset...');

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      console.log('[v0] Reset response:', data);

      if (res.ok) {
        setSubmitted(true);
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      console.error('[v0] Reset password error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50'>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className='flex flex-col items-center gap-4'
        >
          <Loader className='w-8 h-8 text-green-600 animate-spin' />
          <p className='text-slate-700'>Validando enlace...</p>
        </motion.div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-0'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='w-full max-w-md'
        >
          <motion.div
            variants={cardVariants}
            className='bg-white border border-green-100 rounded-2xl shadow-xl overflow-hidden'
          >
            <div className='bg-gradient-to-r from-red-500 to-red-600 px-6 sm:px-8 py-8 sm:py-10'>
              <motion.div variants={itemVariants} className='flex items-center justify-center gap-3 mb-2'>
                <AlertCircle className='w-6 h-6 text-white' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white'>Enlace Inválido</h1>
              </motion.div>
            </div>

            <div className='px-6 sm:px-8 py-8 sm:py-10 space-y-6'>
              <motion.div
                variants={itemVariants}
                className='flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg'
              >
                <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-red-800 mb-1'>Enlace Expirado o Inválido</p>
                  <p className='text-xs text-red-700'>{tokenData?.message}</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className='text-sm text-slate-700 space-y-2'>
                <p>El enlace de reset de contraseña puede haber:</p>
                <ul className='list-disc list-inside space-y-1 pl-2'>
                  <li>Expirado (válido por 30 minutos)</li>
                  <li>Ya sido utilizado</li>
                  <li>Ser incorrecto o estar corrupto</li>
                </ul>
              </motion.div>

              <motion.div variants={itemVariants} className='space-y-3 pt-4'>
                <Link
                  href='/forgot-password'
                  className='w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition text-center block'
                >
                  Solicitar Nuevo Reset
                </Link>
                <Link
                  href='/login'
                  className='w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-slate-900 font-medium rounded-lg transition text-center block flex items-center justify-center gap-2'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Volver al Login
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-0'>
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='w-full max-w-md'
        >
          <motion.div
            variants={cardVariants}
            className='bg-white border border-green-100 rounded-2xl shadow-xl overflow-hidden'
          >
            <div className='bg-gradient-to-r from-green-500 to-emerald-600 px-6 sm:px-8 py-8 sm:py-10'>
              <motion.div variants={itemVariants} className='flex items-center justify-center gap-3 mb-2'>
                <CheckCircle className='w-6 h-6 text-white' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white'>¡Éxito!</h1>
              </motion.div>
            </div>

            <motion.div variants={containerVariants} initial='hidden' animate='visible' className='px-6 sm:px-8 py-8 sm:py-10 space-y-6'>
              <motion.div
                variants={itemVariants}
                className='flex items-start gap-3 p-4 bg-green-50 border border-green-300 rounded-lg'
              >
                <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-medium text-green-800 mb-1'>Contraseña Actualizada</p>
                  <p className='text-xs text-green-700'>Tu contraseña ha sido restablecida correctamente.</p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className='text-sm text-slate-700 text-center'>
                <p>Serás redirigido al login en unos momentos...</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link
                  href='/login'
                  className='w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg transition text-center block'
                >
                  Ir al Login Ahora
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-0'>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='w-full max-w-md'
      >
        <motion.div
          variants={cardVariants}
          className='bg-white border border-green-100 rounded-2xl shadow-xl overflow-hidden'
        >
          {/* Header */}
          <div className='bg-gradient-to-r from-green-500 to-emerald-600 px-6 sm:px-8 py-8 sm:py-10'>
            <motion.div variants={itemVariants} className='flex items-center justify-center gap-3 mb-2'>
              <Lock className='w-6 h-6 text-white' />
              <h1 className='text-2xl sm:text-3xl font-bold text-white'>Nueva Contraseña</h1>
            </motion.div>
            <motion.p variants={itemVariants} className='text-white/90 text-center text-sm'>
              Crea una contraseña segura
            </motion.p>
          </div>

          {/* Content */}
          <motion.div variants={containerVariants} initial='hidden' animate='visible' className='px-6 sm:px-8 py-8 sm:py-10'>
            <motion.form onSubmit={handleSubmit} className='space-y-6' variants={containerVariants} initial='hidden' animate='visible'>
              {/* Info */}
              <motion.div variants={itemVariants} className='text-sm text-slate-800 p-4 bg-green-50 border border-green-300 rounded-lg'>
                <p className='mb-1'>
                  <strong>Correo:</strong> {tokenData?.email}
                </p>
                {tokenData?.fullName && (
                  <p>
                    <strong>Usuario:</strong> {tokenData.fullName}
                  </p>
                )}
              </motion.div>

              {/* New Password */}
              <motion.div variants={itemVariants}>
                <label htmlFor='newPassword' className='block text-sm font-medium text-slate-900 mb-2'>
                  Nueva Contraseña
                </label>
                <div className='relative'>
                  <input
                    id='newPassword'
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='Mínimo 8 caracteres'
                    disabled={loading}
                    required
                    className='w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-3 text-slate-500 hover:text-slate-700'
                  >
                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
                {newPassword && (
                  <div className='mt-2 flex items-center gap-2'>
                    {passwordValid ? (
                      <span className='text-xs text-green-600'>✓ Contraseña válida</span>
                    ) : (
                      <span className='text-xs text-yellow-600'>Mínimo 8 caracteres requeridos</span>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants}>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-slate-900 mb-2'>
                  Confirmar Contraseña
                </label>
                <div className='relative'>
                  <input
                    id='confirmPassword'
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Repite tu contraseña'
                    disabled={loading}
                    required
                    className='w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirm(!showConfirm)}
                    className='absolute right-3 top-3 text-slate-500 hover:text-slate-700'
                  >
                    {showConfirm ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className='mt-2 flex items-center gap-2'>
                    {passwordsMatch ? (
                      <span className='text-xs text-green-600'>✓ Las contraseñas coinciden</span>
                    ) : (
                      <span className='text-xs text-red-600'>Las contraseñas no coinciden</span>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  variants={itemVariants}
                  className='flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg'
                >
                  <AlertCircle className='w-5 h-5 text-red-600 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-red-700'>{error}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                variants={itemVariants}
                type='submit'
                disabled={!canSubmit}
                className='w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <Loader className='w-4 h-4 animate-spin' />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Lock className='w-4 h-4' />
                    Restablecer Contraseña
                  </>
                )}
              </motion.button>

              {/* Back to Login */}
              <motion.div variants={itemVariants} className='text-center'>
                <Link
                  href='/login'
                  className='inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition text-sm font-medium'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Volver al Login
                </Link>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>

        {/* Security Info */}
        <motion.div variants={itemVariants} className='mt-6 p-4 bg-gray-50 border border-gray-300 rounded-lg text-xs text-slate-700'>
          <p className='font-medium text-slate-900 mb-2'>Consejos de seguridad:</p>
          <ul className='space-y-1 list-disc list-inside'>
            <li>Usa una contraseña única y fuerte</li>
            <li>Combina mayúsculas, minúsculas, números y símbolos</li>
            <li>No reutilices contraseñas anteriores</li>
            <li>Guarda tu contraseña en un lugar seguro</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
