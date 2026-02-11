'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar campos
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'admin',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('¡Usuario creado exitosamente! Redirigiendo a login...');
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Error al crear el usuario');
      }
    } catch (err) {
      console.error('[v0] Register error:', err);
      setError('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Crear Usuario</CardTitle>
          <CardDescription className="text-center">
            Crea tu cuenta para acceder al panel de delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className="bg-slate-50"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="bg-slate-50"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="bg-slate-50"
              />
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="bg-slate-50"
              />
            </div>

            {/* Mensajes de Error */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Mensajes de Éxito */}
            {success && (
              <div className="flex gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Botón Registrar */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creando usuario...' : 'Crear Usuario'}
            </Button>

            {/* Link a Login */}
            <p className="text-center text-sm text-slate-600">
              ¿Ya tienes usuario?{' '}
              <a href="/login" className="text-blue-600 hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
