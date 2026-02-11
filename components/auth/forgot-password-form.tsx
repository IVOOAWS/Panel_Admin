'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
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

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      console.log('[v0] Submitting forgot password request for:', email);

      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log('[v0] Response:', data);

      if (res.ok) {
        setSuccessMessage(data.message);
        setSubmitted(true);
        setEmail('');
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (err) {
      console.error('[v0] Forgot password error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 sm:p-0'>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='w-full max-w-md'
      >
        {/* Card */}
        <motion.div
          variants={cardVariants}
          className='bg-white border border-green-100 rounded-2xl shadow-xl overflow-hidden'
        >
          {/* Header */}
          <div className='bg-gradient-to-r from-green-500 to-emerald-600 px-6 sm:px-8 py-8 sm:py-10'>
            <motion.div variants={itemVariants} className='flex items-center justify-center gap-3 mb-2'>
              <Mail className='w-6 h-6 text-white' />
              <h1 className='text-2xl sm:text-3xl font-bold text-white'>
                {submitted ? 'Correo Enviado' : 'Olvidar Contraseña'}
              </h1>
            </motion.div>
            <motion.p variants={itemVariants} className='text-white/90 text-center text-sm'>
              {submitted
                ? 'Revisa tu correo electrónico'
                : 'Restablece tu contraseña fácilmente'}
            </motion.p>
          </div>

          {/* Content */}
          <motion.div variants={containerVariants} initial='hidden' animate='visible' className='px-6 sm:px-8 py-8 sm:py-10'>
            {!submitted ? (
              <form onSubmit={handleSubmit} className='space-y-6'>
                <motion.div variants={itemVariants}>
                  <label htmlFor='email' className='block text-sm font-medium text-slate-900 mb-2'>
                    Correo Electrónico
                  </label>
                  <input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='tu@correo.com'
                    disabled={loading}
                    required
                    className='w-full px-4 py-3 bg-white border-2 border-green-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <p className='mt-2 text-xs text-slate-600'>
                    Ingresa el correo asociado a tu cuenta
                  </p>
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
                  disabled={loading || !email}
                  className='w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:shadow-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                >
                  {loading ? (
                    <>
                      <Loader className='w-4 h-4 animate-spin' />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Mail className='w-4 h-4' />
                      Enviar Instrucciones
                    </>
                  )}
                </motion.button>

                {/* Back to Login */}
                <motion.div variants={itemVariants} className='text-center'>
                  <Link
                    href='/login'
                    className='inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition text-sm font-medium'
                  >
                    <ArrowLeft className='w-4 h-4' />
                    Volver al Login
                  </Link>
                </motion.div>
              </form>
            ) : (
              <motion.div variants={containerVariants} initial='hidden' animate='visible' className='space-y-6'>
                {/* Success Message */}
                <motion.div
                  variants={itemVariants}
                  className='flex items-start gap-3 p-4 bg-green-50 border border-green-300 rounded-lg'
                >
                  <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-green-800 mb-1'>Correo Enviado</p>
                    <p className='text-xs text-green-700'>{successMessage}</p>
                  </div>
                </motion.div>

                {/* Instructions */}
                <motion.div variants={itemVariants} className='space-y-4 text-sm text-slate-700'>
                  <p className='font-medium text-slate-900'>Próximos pasos:</p>
                  <ol className='list-decimal list-inside space-y-2 pl-2'>
                    <li>Revisa tu correo electrónico</li>
                    <li>Si no lo ves, verifica la carpeta de spam</li>
                    <li>Haz clic en el enlace "Restablecer Contraseña"</li>
                    <li>Crea una nueva contraseña segura</li>
                    <li>Inicia sesión con tu nueva contraseña</li>
                  </ol>
                </motion.div>

                {/* Important Note */}
                <motion.div variants={itemVariants} className='p-4 bg-yellow-50 border border-yellow-300 rounded-lg'>
                  <p className='text-xs text-yellow-800'>
                    ⚠️ El enlace expira en <strong>30 minutos</strong>. Si no lo usas antes, deberás solicitar un nuevo reset.
                  </p>
                </motion.div>

                {/* Back to Login */}
                <motion.div variants={itemVariants} className='pt-4'>
                  <Link
                    href='/login'
                    className='w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition text-center block'
                  >
                    Volver al Login
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Link */}
        <motion.div variants={itemVariants} className='text-center mt-6 text-sm text-slate-600'>
          <p>
            ¿Recordaste tu contraseña?{' '}
            <Link href='/login' className='text-green-600 hover:text-green-700 font-medium transition'>
              Inicia sesión aquí
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
