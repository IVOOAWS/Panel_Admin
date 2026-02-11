'use client';

import { useEffect, useState } from 'react';

export default function SessionDebugPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [cookies, setCookies] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setSessionData(data);
        console.log('[v0] Session data:', data);
      } catch (error) {
        console.error('[v0] Error fetching session:', error);
      }
    };

    fetchSession();
    setCookies(document.cookie);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug - Sesión</h1>

      <div className="bg-slate-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Cookies del Navegador:</h2>
        <pre className="text-xs overflow-auto">{cookies || 'No hay cookies'}</pre>
      </div>

      <div className="bg-blue-100 p-4 rounded">
        <h2 className="font-bold mb-2">Datos de Sesión (/api/auth/session):</h2>
        <pre className="text-xs overflow-auto">{JSON.stringify(sessionData, null, 2)}</pre>
      </div>
    </div>
  );
}
