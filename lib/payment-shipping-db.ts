// Payment Methods Database
export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  description: string;
  isEnabled: boolean;
  icon: string;
  commission: number; // percentage
  minAmount: number;
  maxAmount: number;
}

export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  description: string;
  isEnabled: boolean;
  icon: string;
  baseCost: number;
  estimatedDays: number;
  serviceAreas: string[];
  priority: number;
}

// Mock Payment Methods Data
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 1,
    name: 'Tarjeta de Crédito',
    code: 'CREDIT_CARD',
    description: 'Visa, Mastercard, American Express',
    isEnabled: true,
    icon: 'CreditCard',
    commission: 2.5,
    minAmount: 10,
    maxAmount: 999999,
  },
  {
    id: 2,
    name: 'Billetera Digital',
    code: 'DIGITAL_WALLET',
    description: 'PayPal, Apple Pay, Google Pay',
    isEnabled: true,
    icon: 'Wallet',
    commission: 1.5,
    minAmount: 5,
    maxAmount: 500000,
  },
  {
    id: 3,
    name: 'Transferencia Bancaria',
    code: 'BANK_TRANSFER',
    description: 'Transferencia directa a cuenta bancaria',
    isEnabled: true,
    icon: 'Banknote',
    commission: 0,
    minAmount: 100,
    maxAmount: 999999,
  },
  {
    id: 4,
    name: 'Efectivo al Recoger',
    code: 'CASH_ON_DELIVERY',
    description: 'Pago en efectivo al momento de recepción',
    isEnabled: true,
    icon: 'DollarSign',
    commission: 0,
    minAmount: 10,
    maxAmount: 10000,
  },
  {
    id: 5,
    name: 'Criptomonedas',
    code: 'CRYPTOCURRENCY',
    description: 'Bitcoin, Ethereum, USDT',
    isEnabled: false,
    icon: 'Zap',
    commission: 1,
    minAmount: 50,
    maxAmount: 100000,
  },
];

// Mock Shipping Methods Data
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 1,
    name: 'Flety Express',
    code: 'FLETY',
    description: 'Envío rápido por Flety con rastreo en tiempo real',
    isEnabled: true,
    icon: 'Truck',
    baseCost: 50,
    estimatedDays: 1,
    serviceAreas: ['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto'],
    priority: 1,
  },
  {
    id: 2,
    name: 'MRW Delivery',
    code: 'MRW',
    description: 'Servicio de envío confiable con cobertura nacional',
    isEnabled: true,
    icon: 'Truck',
    baseCost: 45,
    estimatedDays: 2,
    serviceAreas: ['Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Maracay'],
    priority: 2,
  },
  {
    id: 3,
    name: 'Yummy Delivery',
    code: 'YUMMY',
    description: 'Servicio de delivery para entregas urbanas',
    isEnabled: true,
    icon: 'Truck',
    baseCost: 35,
    estimatedDays: 1,
    serviceAreas: ['Caracas', 'Valencia', 'Maracay'],
    priority: 3,
  },
  {
    id: 4,
    name: 'Retiro en Tienda',
    code: 'PICKUP',
    description: 'Retira tu compra en una de nuestras sucursales',
    isEnabled: true,
    icon: 'Store',
    baseCost: 0,
    estimatedDays: 0,
    serviceAreas: ['Nacional'],
    priority: 0,
  },
  {
    id: 5,
    name: 'Envío Internacional',
    code: 'INTERNATIONAL',
    description: 'Envío a nivel internacional con DHL/FedEx',
    isEnabled: false,
    icon: 'Globe',
    baseCost: 200,
    estimatedDays: 5,
    serviceAreas: ['Internacional'],
    priority: 4,
  },
];

// Get single payment method
export function getPaymentMethodById(id: number): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id);
}

// Get single shipping method
export function getShippingMethodById(id: number): ShippingMethod | undefined {
  return SHIPPING_METHODS.find((m) => m.id === id);
}

// Get all enabled payment methods
export function getEnabledPaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS.filter((m) => m.isEnabled);
}

// Get all enabled shipping methods
export function getEnabledShippingMethods(): ShippingMethod[] {
  return SHIPPING_METHODS.filter((m) => m.isEnabled);
}

// Toggle payment method
export function togglePaymentMethod(id: number, enabled: boolean): PaymentMethod | undefined {
  const method = PAYMENT_METHODS.find((m) => m.id === id);
  if (method) {
    method.isEnabled = enabled;
    return method;
  }
  return undefined;
}

// Toggle shipping method
export function toggleShippingMethod(id: number, enabled: boolean): ShippingMethod | undefined {
  const method = SHIPPING_METHODS.find((m) => m.id === id);
  if (method) {
    method.isEnabled = enabled;
    return method;
  }
  return undefined;
}
