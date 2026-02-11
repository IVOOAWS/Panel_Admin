/**
 * Cliente para la API de IVOOAPP
 * Maneja autenticación, requests y manejo de errores
 */

interface IVOOAppConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retries?: number;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

class IVOOAppClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private retries: number;

  constructor(config: IVOOAppConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;

    // Validar configuración
    if (!this.baseUrl || !this.apiKey) {
      throw new Error('IVOOAPP_API_URL y IVOOAPP_API_KEY son requeridos');
    }

    if (!this.baseUrl.startsWith('http')) {
      throw new Error('IVOOAPP_API_URL debe ser una URL válida (http/https)');
    }
  }

  /**
   * Realiza una solicitud HTTP a la API
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`
          );
        }

        const data = await response.json();
        return {
          success: true,
          data,
          statusCode: response.status,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        console.error(`[IVOOApp] Intento ${attempt}/${this.retries} falló:`, lastError.message);

        // No reintentar en errores de autenticación o validación
        if (
          lastError.message.includes('401') ||
          lastError.message.includes('403') ||
          lastError.message.includes('400')
        ) {
          break;
        }

        // Esperar antes de reintentar (backoff exponencial)
        if (attempt < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Error desconocido',
    };
  }

  /**
   * Obtener todas las órdenes
   */
  async getOrders(filters?: {
    status?: string;
    storeId?: number;
    page?: number;
    limit?: number;
  }): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.storeId) params.append('storeId', filters.storeId.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/orders${query}`);
  }

  /**
   * Obtener detalles de una orden específica
   */
  async getOrder(orderId: string): Promise<APIResponse<any>> {
    return this.request(`/orders/${orderId}`);
  }

  /**
   * Crear una nueva orden
   */
  async createOrder(orderData: any): Promise<APIResponse<any>> {
    return this.request('/orders', {
      method: 'POST',
      body: orderData,
    });
  }

  /**
   * Actualizar una orden existente
   */
  async updateOrder(orderId: string, orderData: any): Promise<APIResponse<any>> {
    return this.request(`/orders/${orderId}`, {
      method: 'PUT',
      body: orderData,
    });
  }

  /**
   * Eliminar una orden
   */
  async deleteOrder(orderId: string): Promise<APIResponse<any>> {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Obtener todas las tiendas
   */
  async getStores(): Promise<APIResponse<any[]>> {
    return this.request('/stores');
  }

  /**
   * Obtener tienda específica
   */
  async getStore(storeId: number): Promise<APIResponse<any>> {
    return this.request(`/stores/${storeId}`);
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats(filters?: {
    startDate?: string;
    endDate?: string;
    storeId?: number;
  }): Promise<APIResponse<any>> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.storeId) params.append('storeId', filters.storeId.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/stats${query}`);
  }

  /**
   * Verificar salud de la API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

/**
 * Instancia singleton del cliente IVOOAPP
 */
let clientInstance: IVOOAppClient | null = null;

export function getIVOOAppClient(): IVOOAppClient {
  if (!clientInstance) {
    const baseUrl = process.env.IVOOAPP_API_URL;
    const apiKey = process.env.IVOOAPP_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error(
        'Las variables de entorno IVOOAPP_API_URL y IVOOAPP_API_KEY deben estar configuradas'
      );
    }

    clientInstance = new IVOOAppClient({
      baseUrl,
      apiKey,
      timeout: 30000,
      retries: 3,
    });
  }

  return clientInstance;
}

// Exportar la clase para pruebas
export { IVOOAppClient, type IVOOAppConfig, type RequestOptions, type APIResponse };
