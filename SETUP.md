# Panel Admin IVOO - Guía de Configuración

## 🚀 Quick Start (5 minutos)

### 1. Clonar y Actualizar

```bash
git clone <repository-url>
cd Panel-Admin
git checkout admin-panel-with-api
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

Llena las siguientes variables:

```env
# Base de Datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=paneldelivery

# API IVOOAPP (obtén credenciales del panel)
IVOOAPP_API_URL=https://api.ivooapp.com/v1
IVOOAPP_API_KEY=tu_token_aqui

# Seguridad
SESSION_SECRET=genera_una_clave_aleatoria_de_32_caracteres
```

### 3. Validar Configuración

```bash
npm run validate:env
```

### 4. Iniciar Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📚 Documentación Completa

### Configuración de Variables de Entorno
**Archivo**: `ENV_SETUP.md`
- Variables de base de datos
- Variables de API IVOOAPP
- Ejemplos para dev/staging/producción
- Troubleshooting

### Integración con API IVOOAPP
**Archivo**: `IVOOAPP_INTEGRATION.md`
- Cómo usar el cliente IVOOAPP
- Sincronización de datos
- Ejemplos de código
- Rate limiting y caché

---

## 🔑 Variables de Entorno Requeridas

### Base de Datos MySQL

| Variable | Descripción | Valor Ejemplo |
|----------|-------------|---------------|
| `DB_HOST` | Host del servidor MySQL | `localhost` |
| `DB_USER` | Usuario MySQL | `root` |
| `DB_PASSWORD` | Contraseña MySQL | `password123` |
| `DB_NAME` | Nombre de la base de datos | `paneldelivery` |
| `DB_PORT` | Puerto MySQL | `3306` |

### API IVOOAPP

| Variable | Descripción | Valor Ejemplo |
|----------|-------------|---------------|
| `IVOOAPP_API_URL` | URL base de la API | `https://api.ivooapp.com/v1` |
| `IVOOAPP_API_KEY` | Bearer Token | `eyJhbGciOiJIUzI1NiIs...` |

### Seguridad

| Variable | Descripción | Valor Ejemplo |
|----------|-------------|---------------|
| `SESSION_SECRET` | Secreto para sesiones (mín 32 caracteres) | `aBcD1234eFgH5678...` |
| `NODE_ENV` | Entorno | `development` |

---

## ✅ Características Implementadas

### Gestión de Tiendas
- ✅ Página de gestión de tiendas con mapa interactivo
- ✅ 28 tiendas IVOO mapeadas en Venezuela
- ✅ Pines personalizados con logo IVOO
- ✅ Filtro de tiendas en órdenes

### Estadísticas por Tienda
- ✅ Tabla de ingresos, gastos y ganancias
- ✅ Vista por región y ciudad
- ✅ Mostrar tienda de origen en órdenes
- ✅ Detalles de tienda en modal de envío

### Integración API IVOOAPP
- ✅ Cliente robusto con reintentos automáticos
- ✅ Sincronización de órdenes
- ✅ Manejo de errores y timeouts
- ✅ Validación de variables de entorno

---

## 📁 Estructura de Proyecto

```
.
├── app/
│   ├── admin/
│   │   ├── dashboard/     # Dashboard con KPIs
│   │   ├── orders/        # Gestión de órdenes
│   │   ├── stores/        # Nuevo: Gestión de tiendas
│   │   └── layout.tsx
│   ├── api/
│   │   ├── orders/        # API de órdenes
│   │   └── stores/        # API de tiendas
│   └── layout.tsx
├── components/
│   └── admin/
│       ├── stores-map.tsx      # Mapa interactivo
│       ├── orders-table.tsx    # Tabla de órdenes
│       └── ...
├── lib/
│   ├── db.ts                   # Conexión MySQL
│   ├── stores-db.ts            # Base de datos de tiendas
│   ├── ivooapp-client.ts       # Cliente API IVOOAPP
│   └── ...
├── scripts/
│   └── validate-env.ts         # Validador de .env
├── .env.example                # Template de variables
├── ENV_SETUP.md               # Documentación variables
├── IVOOAPP_INTEGRATION.md     # Documentación API
└── SETUP.md                   # Este archivo
```

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                    # Inicia servidor de desarrollo

# Producción
npm run build                  # Compila para producción
npm start                      # Inicia servidor producción

# Validación
npm run validate:env          # Valida variables de entorno

# Linting
npm run lint                  # Verifica código
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"

```bash
# Verifica que MySQL está corriendo
mysql -h localhost -u root

# Crea la base de datos si no existe
CREATE DATABASE paneldelivery;
```

### Error: "IVOOAPP_API_KEY is invalid"

1. Obtén API Key del panel de IVOOAPP
2. Verifica que no haya espacios extras en .env
3. Ejecuta `npm run validate:env`

### Error: "Session secret is too short"

Genera uno seguro con:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
```

---

## 🔒 Seguridad

**Importante**: Nunca commits `.env` a control de versiones

```bash
# Verificar que .env está ignorado
git check-ignore .env

# Si aparece en git status, removerlo
git rm --cached .env
```

---

## 📊 Cliente IVOOAPP

El proyecto incluye un cliente robusto para interactuar con la API:

```typescript
import { getIVOOAppClient } from '@/lib/ivooapp-client';

const client = getIVOOAppClient();

// Obtener órdenes
const response = await client.getOrders({ status: 'pending' });

// Obtener tiendas
const stores = await client.getStores();

// Verificar disponibilidad
const isHealthy = await client.healthCheck();
```

Ver `IVOOAPP_INTEGRATION.md` para más ejemplos.

---

## 📝 Credenciales de Demostración

Para desarrollo local:

- **Email:** admin@delivery.com
- **Contraseña:** admin123

---

## ✨ Próximos Pasos

1. **Completar datos de tiendas** - Actualizar coordenadas reales en `lib/stores-db.ts`
2. **Sincronizar órdenes** - Integrar endpoint real en `app/api/orders/route.ts`
3. **Agregar autenticación** - Supabase Auth o Auth.js
4. **Tests** - Jest + React Testing Library
5. **Deploy** - Vercel, AWS o tu hosting

---

## 🛠️ Stack Técnico

- **Framework**: Next.js 16 (App Router)
- **Base de Datos**: MySQL con mysql2
- **UI**: shadcn/ui + Tailwind CSS
- **Mapas**: Leaflet + react-leaflet
- **Autenticación**: iron-session + bcryptjs
- **API Client**: Fetch nativo con reintentos automáticos

---

## 📞 Soporte

### Documentación Local
- `ENV_SETUP.md` - Variables de entorno
- `IVOOAPP_INTEGRATION.md` - Integración API
- `.env.example` - Template de variables

### Documentación Externa
- IVOOAPP: https://docs.ivooapp.com
- Next.js: https://nextjs.org/docs
- MySQL: https://dev.mysql.com/doc/

---

**Última actualización**: Febrero 2026
