# Guía Completa: Bearer Token con email:password

## 🎯 ¿Qué es el Bearer Token?

El Bearer token es un mecanismo de autenticación simple donde:
- **Formato**: `email:password` codificado en Base64
- **Uso**: Se envía en el header `Authorization: Bearer {token}`
- **Ventaja**: No requiere servicios externos de autenticación

---

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa email + contraseña en login
2. Sistema valida las credenciales contra la BD
3. Si son válidas, genera: Base64(email:password)
4. Devuelve el Bearer token al cliente
5. Cliente guarda el token en localStorage
6. Cliente envía el token en cada solicitud protegida
```

---

## 🔐 Generación del Bearer Token

### Paso 1: Validar credenciales
```javascript
// Desde el login
const email = "admin@empresa.com";
const password = "admin123";

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const data = await response.json();
// data.bearerToken = "YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM="
```

### Paso 2: Guardar el token
```javascript
// En localStorage (cliente)
localStorage.setItem('bearerToken', data.bearerToken);

// O en sessionStorage
sessionStorage.setItem('bearerToken', data.bearerToken);

// O en una cookie HTTP-only (más seguro)
// El servidor la establece automáticamente
```

### Paso 3: Usar el token en peticiones
```javascript
const token = localStorage.getItem('bearerToken');

const response = await fetch('/api/admin/users', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📦 Codificación Base64

### Ejemplo Manual

```bash
# En Linux/Mac
echo -n "admin@empresa.com:admin123" | base64
# Resultado: YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=

# Decodificar
echo "YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=" | base64 -d
# Resultado: admin@empresa.com:admin123
```

### Ejemplo en JavaScript

```javascript
// Codificar
const email = "admin@empresa.com";
const password = "admin123";
const credentials = `${email}:${password}`;
const bearerToken = Buffer.from(credentials).toString('base64');
console.log(bearerToken); // YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=

// Decodificar
const decoded = Buffer.from(bearerToken, 'base64').toString('utf-8');
const [decodedEmail, decodedPassword] = decoded.split(':');
console.log(decodedEmail);    // admin@empresa.com
console.log(decodedPassword); // admin123
```

### Ejemplo en Python

```python
import base64

# Codificar
email = "admin@empresa.com"
password = "admin123"
credentials = f"{email}:{password}"
bearer_token = base64.b64encode(credentials.encode()).decode()
print(bearer_token)  # YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=

# Decodificar
decoded = base64.b64decode(bearer_token).decode()
email, password = decoded.split(':')
print(email)    # admin@empresa.com
print(password) # admin123
```

---

## 🌐 Ejemplos de Peticiones HTTP

### Con cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "admin123"
  }'
```

**Usar Bearer Token:**
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=" \
  -H "Content-Type: application/json"
```

### Con Postman

1. **Ir a la pestaña "Headers"**
2. **Agregar:**
   - Key: `Authorization`
   - Value: `Bearer YWRtaW5AZW1wcmVzYS5jb206YWRtaW4xMjM=`
3. **Enviar la solicitud**

### Con Fetch API (JavaScript)

```javascript
// Petición con Bearer token
async function getUsers(bearerToken) {
  const response = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}

// Petición POST con Bearer token
async function createUser(bearerToken, userData) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
}
```

### Con Axios (JavaScript)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bearerToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uso
api.get('/api/admin/users')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
```

---

## 🛡️ Validación del Bearer Token en el Backend

### Ubicación: `lib/bearer-token.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { decodeBearerToken } from '@/lib/bearer-token';

export function validateBearerToken(req: NextRequest): 
  { email: string; password: string } | null {
  
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7); // Remover "Bearer "
  
  try {
    return decodeBearerToken(token);
  } catch (error) {
    console.error('[v0] Invalid Bearer token:', error);
    return null;
  }
}
```

### Uso en Route Handlers

```typescript
import { validateBearerToken } from '@/lib/bearer-token';

export async function GET(req: NextRequest) {
  const credentials = validateBearerToken(req);
  
  if (!credentials) {
    return NextResponse.json(
      { error: 'Invalid or missing Bearer token' },
      { status: 401 }
    );
  }
  
  const { email, password } = credentials;
  
  // Validar credenciales contra la BD
  // ... resto del código
}
```

---

## ⚠️ Consideraciones de Seguridad

### ✅ Lo que sí hacer

- ✅ Usar HTTPS/TLS en producción
- ✅ Guardar tokens en cookies HTTP-only
- ✅ Validar el token en cada petición
- ✅ Establecer expiración del token
- ✅ Usar CORS correctamente
- ✅ Loguear accesos sospechosos

### ❌ Lo que NO hacer

- ❌ No exponer el Bearer token en URLs
- ❌ No enviar tokens sin HTTPS
- ❌ No guardar contraseñas en texto plano
- ❌ No confiar solo en el cliente para validar
- ❌ No usar Bearer token para usuarios anónimos
- ❌ No guardar tokens en localStorage (si es sensible)

---

## 🔄 Manejo de Errores

### Respuesta 401 Unauthorized

```javascript
fetch('/api/admin/users', {
  headers: {
    'Authorization': 'Bearer invalid_token'
  }
})
.then(res => {
  if (res.status === 401) {
    // Token inválido o expirado
    localStorage.removeItem('bearerToken');
    window.location.href = '/login';
  }
  return res.json();
})
.catch(err => console.error(err));
```

### Respuesta 403 Forbidden

```javascript
// Usuario sin permisos suficientes
{
  "error": "Insufficient permissions",
  "status": 403
}
```

---

## 🧪 Pruebas Rápidas

### Test 1: Generar Token Válido

```bash
# Generar el token
TOKEN=$(echo -n "admin@empresa.com:admin123" | base64)
echo "Token: $TOKEN"

# Usar el token
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN"
```

### Test 2: Token Inválido

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer invalid_token"
# Esperado: 401 Unauthorized
```

### Test 3: Sin Token

```bash
curl -X GET http://localhost:3000/api/admin/users
# Esperado: 401 Unauthorized
```

---

## 📊 Comparación con Otros Métodos

| Método | Ventaja | Desventaja |
|--------|---------|-----------|
| **Bearer Token (Email:Password)** | Simple, no requiere DB extra | Menos seguro si se expone |
| **JWT** | Más seguro, autónomo | Más complejo |
| **OAuth 2.0** | Muy seguro, estándar | Requiere servidor OAuth |
| **Session Cookies** | Seguro, estándar | Requiere estado en servidor |

---

## 🎓 Conclusión

El Bearer token con `email:password` es una forma **simple y efectiva** de autenticar usuarios, perfecta para:
- ✅ Prototipos y MVPs
- ✅ APIs internas
- ✅ Aplicaciones pequeñas y medianas
- ✅ Sistemas administrativos

Para aplicaciones de producción críticas, considera JWT, OAuth 2.0 o Session Cookies.

---

**¡Listo para usar!** 🚀
