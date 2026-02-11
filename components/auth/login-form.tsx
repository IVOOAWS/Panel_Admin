'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Truck, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, options: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.23, 1, 0.320, 1] },
  },
};

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

  // Cargar script de Google
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleScriptLoaded(true);
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: handleGoogleSuccess,
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Renderizar botón de Google cuando el script esté listo
  useEffect(() => {
    if (googleScriptLoaded && window.google) {
      const googleButtonDiv = document.getElementById('google-signin-button');
      if (googleButtonDiv && googleButtonDiv.children.length === 0) {
        window.google.accounts.id.renderButton(googleButtonDiv, {
          type: 'standard',
          size: 'large',
          width: '100%',
          theme: 'outline',
          text: 'continue_with',
        });
      }
    }
  }, [googleScriptLoaded]);

  const handleGoogleSuccess = async (response: any) => {
    setLoading(true);
    setError('');

    try {
      // Decodificar JWT (sin verificación en cliente, se verificaría en servidor)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      const profile = JSON.parse(jsonPayload);

      // Enviar al backend
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', profile.email);
        
        // Redirigir según el panel
        const redirectPath = `/admin/${data.panel || 'dashboard'}`;
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push(redirectPath);
      } else {
        setError('Error al procesar Google OAuth');
        setLoading(false);
      }
    } catch (err) {
      console.error('[v0] Google OAuth error:', err);
      setError('Error al procesar Google OAuth');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', data.user.email);
        localStorage.setItem('bearerToken', data.bearerToken); // Guardar Bearer token
        console.log('[v0] Bearer token guardado:', data.bearerToken);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/admin/dashboard');
      } else {
        setError(data.message || 'Usuario o contraseña incorrectos');
        setLoading(false);
      }
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('Error al procesar la solicitud');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Decorative */}
      <motion.div
        className="hidden lg:flex flex-col items-center justify-center lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage: 'linear-gradient(45deg, transparent 30%, #0add73 50%, transparent 70%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(10, 221, 115, .05) 25%, rgba(10, 221, 115, .05) 26%, transparent 27%, transparent 74%, rgba(10, 221, 115, .05) 75%, rgba(10, 221, 115, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(10, 221, 115, .05) 25%, rgba(10, 221, 115, .05) 26%, transparent 27%, transparent 74%, rgba(10, 221, 115, .05) 75%, rgba(10, 221, 115, .05) 76%, transparent 77%, transparent)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Animated Trucks */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-6"
            >
              <Truck className="w-20 h-20 text-[#0add73]" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center max-w-xs">
            <h2 className="text-white text-3xl font-bold mb-3">IVOO</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Panel de gestión de logística y entregas en tiempo real
            </p>
          </motion.div>

          {/* Delivery Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6 mt-8">
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center"
              whileHover={{ borderColor: '#0add73' }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl font-bold text-[#0add73]">2.4M</div>
              <p className="text-slate-400 text-xs mt-1">Entregas</p>
            </motion.div>
            <motion.div
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center"
              whileHover={{ borderColor: '#0add73' }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-2xl font-bold text-[#0add73]">98%</div>
              <p className="text-slate-400 text-xs mt-1">Éxito</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Right Section - Login Form */}
      <motion.div
        className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-8 py-8 bg-gradient-to-br from-slate-50 to-slate-100/50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={cardVariants}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-slate-100/50 backdrop-blur-sm"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <motion.div className="mb-6 flex justify-center">
              <svg
                viewBox="0 0 1531.49 467.54"
                className="w-32 h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <style>
                    {`.cls-1, .cls-2 { stroke-width: 0px; } .cls-2 { fill: #0add73; }`}
                  </style>
                </defs>
                <g id="Layer_2-2">
                  <g>
                    <g>
                      <path className="cls-1" d="M1170.12,179.62c-3.53-1.02-7.14-1.84-10.59-3.1-21.17-7.79-36.16-22.41-37.81-44.81-2.06-28.07-2.2-56.55.07-84.6,2.18-26.91,27.6-47.03,54.81-47.05,99.45-.08,198.9-.07,298.35,0,26.14.02,48.78,18.14,55.08,43.66.39,1.56.98,3.08,1.47,4.61v82.99c-3.24,11.05-7.31,21.57-15.52,30.22-9.46,9.96-21.38,14.89-34.33,18.08h-311.53ZM1325.55,134.41c47.32,0,94.64,0,141.97,0,14.1,0,17.87-3.68,17.87-17.42,0-18.98.03-37.96-.01-56.94-.02-10.08-4.62-14.66-14.88-14.78-8.72-.1-17.43-.02-26.15-.02-86.96,0-173.93,0-260.89,0-12.83,0-16.86,3.97-16.86,16.49,0,18.57,0,37.13,0,55.7,0,13.09,3.87,16.96,17,16.97,47.32,0,94.64,0,141.97,0Z" fill="currentColor" />
                      <path className="cls-1" d="M685.37,179.62c-2.56-.71-5.1-1.45-7.67-2.11-25.76-6.67-43.17-28.89-43.21-55.23-.03-21.66-.03-43.33,0-64.99.05-32.3,25.15-57.26,57.57-57.26,98.8,0,197.61,0,296.41,0,31.72,0,56.97,25,57.02,56.46.04,21.46,0,42.91,0,64.37,0,29.37-18.25,51.62-47.19,57.6-.93.19-1.77.77-2.65,1.17-103.43,0-206.86,0-310.29,0ZM839.58,134c48.39,0,96.78,0,145.17,0,10.37,0,14.63-4.3,14.64-14.75.02-19.61.02-39.22,0-58.83-.01-10.83-4.24-15.16-14.96-15.16-96.16-.02-192.31-.02-288.47,0-11.03,0-15.35,4.4-15.37,15.49-.02,19.2-.02,38.39,0,57.59,0,11.56,4.12,15.66,15.68,15.66,47.77,0,95.53,0,143.3,0Z" fill="currentColor" />
                      <path className="cls-1" d="M195.64,179.62c-5.07-1.6-10.35-2.73-15.17-4.89-21.4-9.56-34.05-26.08-34.49-49.43-.8-41.45-.22-82.93-.22-124.84h46.15v6.47c0,36.54,0,73.07,0,109.61,0,11.53,5.32,17.53,16.72,17.78,76.14,1.63,150.8-6.61,222.46-33.93,24.13-9.2,47.03-20.74,67.02-37.3,19.52-16.16,33.26-35.21,30.12-62.63h43.75c2.85,14.75,1.51,29.38-4,43.38-9.65,24.54-26.78,43.45-47.54,59.24-35.19,26.78-75.56,42.63-117.84,54.15-48.86,13.31-98.75,19.74-149.32,21.4-1.78.06-3.54.65-5.3,1h-52.34Z" fill="currentColor" />
                      <path className="cls-1" d="M0,179.62V.45h44.63c.14,1.32.42,2.68.42,4.05.02,56.73.02,113.46.01,170.19,0,1.65-.13,3.29-.2,4.94H0Z" fill="currentColor" />
                    </g>
                    <g>
                      <path className="cls-2" d="M204.54,383.12c0,57.41-38.35,84.42-79.11,84.42H0v-168.84h125.42c40.76,0,79.11,27.01,79.11,84.42ZM141.82,383.12c0-31.36-22.19-31.36-35.7-31.36h-43.42v62.71h43.42c13.51,0,35.7,0,35.7-31.36Z" />
                      <path className="cls-2" d="M280.68,346.94v15.68h115.77v41h-115.77v15.68h115.77v48.24h-178.49v-168.84h178.49v48.24h-115.77Z" />
                      <path className="cls-2" d="M588.16,414.48v53.06h-173.66v-168.84h62.71v115.77h110.95Z" />
                      <path className="cls-2" d="M659.97,467.54h-62.71v-168.84h62.71v168.84Z" />
                      <path className="cls-2" d="M901.31,298.7l-69.95,168.84h-93.1l-69.95-168.84h68.98l47.52,125.42,47.52-125.42h68.98Z" />
                      <path className="cls-2" d="M973.02,346.94v15.68h115.77v41h-115.77v15.68h115.77v48.24h-178.48v-168.84h178.48v48.24h-115.77Z" />
                      <path className="cls-2" d="M1274.23,419.06l29.91,48.48h-74.29l-23.4-39.56h-36.9v39.56h-62.71v-168.84h132.66c38.35,0,64.64,27.01,64.64,64.64,0,24.6-11.34,44.86-29.91,55.72ZM1169.55,374.92h57.89c6.27,0,13.99,0,13.99-11.58s-7.72-11.58-13.99-11.58h-57.89v23.15Z" />
                      <path className="cls-2" d="M1297.05,298.7h72.36l44.86,62.71,44.86-62.71h72.36l-85.87,113.36v55.48h-62.71v-55.48l-85.87-113.36Z" />
                    </g>
                  </g>
                </g>
              </svg>
            </motion.div>
            
            <motion.p
              className="text-slate-600 text-sm"
            >
              Accede a tu panel de administración
            </motion.p>
          </motion.div>

          {/* Error Alert */}
          {error && (
            <motion.div
              variants={itemVariants}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Username Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-900">
                Usuario
              </label>
              <div className="relative group">
                <div className="absolute  bg-gradient-to-r from-[#0add73]/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0add73] transition-colors" />
                <input
                  id="username"
                  type="text"
                  placeholder="tu_usuario@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border-2 border-slate-200 placeholder-slate-400 text-slate-900 text-sm focus:bg-white focus:border-[#0add73] focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                Contraseña
              </label>
              <div className="relative group">
                <div className="absolute bg-gradient-to-r from-[#0add73]/10 to-transparent rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#0add73] transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-11 pl-10 pr-11 bg-slate-50 border-2 border-slate-200 placeholder-slate-400 text-slate-900 text-sm focus:bg-white focus:border-[#0add73] focus:ring-0 focus:outline-none rounded-lg transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember me & Forgot Password */}
            <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-slate-300 accent-[#0add73] cursor-pointer"
                  disabled={loading}
                />
                <label htmlFor="remember" className="ml-2.5 text-sm text-slate-600 cursor-pointer">
                  Recuerda este dispositivo
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-[#0add73] hover:text-[#08a85e] font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#0add73] to-[#08a85e] hover:from-[#09c366] hover:to-[#079a54] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">O continúa con</span>
            </div>
          </motion.div>

          {/* Google Button */}
          <motion.div variants={itemVariants} id="google-signin-button" className="w-full" />


        </motion.div>
      </motion.div>
    </div>
  );
}
