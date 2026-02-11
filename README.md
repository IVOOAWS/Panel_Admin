# IVOO Panel Admin 🚀
### Sistema Centralizado de Logística y Gestión E-commerce

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**IVOO Panel Admin** es una plataforma de administración robusta diseñada para centralizar la logística y las operaciones de e-commerce de IVOO. El sistema actúa como un puente inteligente entre la infraestructura de **Magento/AWS (IVOOApp)** y una base de datos local **MySQL**, permitiendo la sincronización en tiempo real y la gestión avanzada de entregas de última milla.

---

## 🏗️ Arquitectura Técnica

El proyecto utiliza una arquitectura de **Híbrida de Datos** y una interfaz moderna basada en componentes de alta fidelidad:

* **Frontend:** Next.js 15 (App Router) para una navegación optimizada y Server Components.
* **Lenguaje:** TypeScript para garantizar la integridad de los datos en toda la aplicación.
* **Estilos:** Tailwind CSS con componentes UI basados en Radix UI (vía shadcn/ui).
* **Backend/API:** Route Handlers de Next.js integrados con una capa de servicio para comunicación externa (Magento API).
* **Base de Datos:** MySQL para persistencia de configuraciones locales y logs de auditoría.

---

## ✨ Características Principales

### 📦 Gestión de Pedidos (Orders)
* **Vistas Especializadas:** Filtros inteligentes para diferenciar pedidos de **PickUp** (identificando la tienda física) y **Delivery**.
* **Seguimiento en Vivo:** Integración de mapas para visualizar la ruta del transportista.
* **Prueba de Entrega (PoD):** Validación mediante firmas digitales y fotografías integradas directamente en el detalle del pedido.

### 🛵 Módulo Yummy Delivery
Una de las piezas centrales del sistema, dividida en tres flujos críticos:
1.  **Monitoreo de Viajes (Trip Status):** Seguimiento en tiempo real del estado de las solicitudes enviadas a Yummy.
2.  **Creación de Viajes:** Proceso optimizado en 2 pasos que cruza datos de las tiendas IVOO con la API de Yummy para asignación inmediata.
3.  **Cancelación Centralizada:** Gestión de incidencias directamente desde el panel sin necesidad de herramientas externas.

### 🚛 Gestión de Flota y Logística
* **Vehículos:** Registro y control de flota propia.
* **Tracking:** Visualización geográfica de unidades operativas.
* **Configuración de Métodos:** Panel administrativo para habilitar/deshabilitar métodos de pago y envío de forma dinámica.

---

## 🚀 Guía de Uso y Configuración

### Pre-requisitos
* Node.js 18.x o superior.
* Instancia de MySQL activa.
* Credenciales de API para los servicios de Magento/IVOOApp.

### Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/panel_admin.git](https://github.com/tu-usuario/panel_admin.git)
    cd panel_admin
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    # o npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz y añade las siguientes claves:
    ```env
    DATABASE_URL="mysql://usuario:password@localhost:3306/ivoo_admin"
    IVOO_API_ENDPOINT="[https://api.ivoo.com/v1](https://api.ivoo.com/v1)"
    IVOO_API_TOKEN="tu_token_aqui"
    NEXTAUTH_SECRET="tu_secreto_para_sesiones"
    ```

4.  **Inicializar Base de Datos:**
    ```bash
    # Ejecuta el script de esquema incluido en la carpeta /scripts
    mysql -u usuario -p ivoo_admin < scripts/database-schema.sql
    ```

5.  **Ejecutar en Desarrollo:**
    ```bash
    npm run dev
    ```

---

## 🛠️ Estructura de Carpetas

```text
├── app/                # Rutas de la aplicación (Next.js App Router)
│   ├── admin/          # Vistas principales (Orders, Yummy, Dashboard)
│   ├── api/            # Endpoints de API internos
├── components/         # Componentes UI reutilizables
│   ├── admin/          # Componentes específicos del dashboard
│   ├── yummy/          # Lógica visual del módulo Yummy
│   └── ui/             # Componentes base (Botones, Inputs, etc.)
├── lib/                # Utilidades, clientes de API (ivooapp-client.ts) y DB
├── scripts/            # Scripts SQL de inicialización y semillas
└── public/             # Assets estáticos (Logos, imágenes)