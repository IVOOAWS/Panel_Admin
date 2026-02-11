// Store management with real IVOO locations
export interface Store {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  region: string;
}

// All 28 IVOO store locations with coordinates
export const STORES: Store[] = [
  // Valencia
  { id: 1, name: "IVOO Valencia (Naguanagua)", address: "CR MANZANA A LOCAL GALPON NRO. 1-4 URB VALLE ALTO", latitude: 10.2610627, longitude: -68.0050111, city: "Valencia", region: "Carabobo" },
  { id: 2, name: "IVOO Valencia (Av. Bolívar)", address: "Centro Comercial Gravina, Av. Bolívar Norte", latitude: 10.2193204, longitude: -68.0121884, city: "Valencia", region: "Carabobo" },
  { id: 3, name: "IVOO Valencia (Av. Lara)", address: "Av. Lara con Feria, al lado de la estación del metro", latitude: 10.1785222, longitude: -68.0051431, city: "Valencia", region: "Carabobo" },

  // Caracas
  { id: 4, name: "IVOO Caracas (Sambil La Candelaria)", address: "C.C. Sambil La Candelaria, Nivel Galería", latitude: 10.505001, longitude: -66.9036363, city: "Caracas", region: "Distrito Capital" },
  { id: 5, name: "IVOO Caracas (Plaza Venezuela)", address: "Av. Las Acacias, Torre La Previsora", latitude: 10.4975891, longitude: -66.8835086, city: "Caracas", region: "Distrito Capital" },
  { id: 6, name: "IVOO Caracas (C.C. Líder)", address: "C.C. Líder, Nivel Automercado, Boleíta Sur", latitude: 10.4861521, longitude: -66.8232729, city: "Caracas", region: "Distrito Capital" },
  { id: 7, name: "IVOO Caracas (Boleíta)", address: "Final Calle Imboca, Boleíta", latitude: 10.4861783, longitude: -66.8309977, city: "Caracas", region: "Distrito Capital" },
  { id: 8, name: "IVOO Caracas (Av. Libertador)", address: "Av. Las Acacias con Av. Libertador", latitude: 10.4975891, longitude: -66.8835086, city: "Caracas", region: "Distrito Capital" },

  // Maracay
  { id: 9, name: "IVOO Maracay (C.C. Los Aviadores)", address: "C.C. Parque Los Aviadores, Av. Los Aviadores", latitude: 10.1885998, longitude: -67.5823104, city: "Maracay", region: "Aragua" },
  { id: 10, name: "IVOO Maracay (Av. Las Delicias)", address: "Av. Las Delicias, C.C. Las Camelias", latitude: 10.2688765, longitude: -67.5895612, city: "Maracay", region: "Aragua" },

  // Barquisimeto
  { id: 11, name: "IVOO Barquisimeto (Av. Lara)", address: "Torre Esser, Av. Lara", latitude: 10.0646381, longitude: -69.2958692, city: "Barquisimeto", region: "Lara" },
  { id: 12, name: "IVOO Barquisimeto (Sambil)", address: "C.C. Sambil Barquisimeto, Nivel PB", latitude: 10.0646643, longitude: -69.303594, city: "Barquisimeto", region: "Lara" },

  // Maracaibo
  { id: 13, name: "IVOO Maracaibo (Av. Las Delicias)", address: "Av. 15 Prolongación Las Delicias, Sector San José", latitude: 10.6667261, longitude: -71.6223708, city: "Maracaibo", region: "Zulia" },
  { id: 14, name: "IVOO San Francisco", address: "C.C. Paseo San Francisco, Av. 5", latitude: 10.5555585, longitude: -71.621211, city: "San Francisco", region: "Zulia" },

  // Mérida
  { id: 15, name: "IVOO Mérida (C.C. Rodeo Plaza)", address: "C.C. Rodeo Plaza, Av. Las Américas", latitude: 8.5896344, longitude: -71.1641318, city: "Mérida", region: "Mérida" },
  { id: 16, name: "IVOO El Vigía (C.C. Junior Mall)", address: "Av. Don Pepe Rojas, C.C. Junior Mall", latitude: 8.6110882, longitude: -71.6636064, city: "El Vigía", region: "Mérida" },

  // Táchira
  { id: 17, name: "IVOO San Cristóbal (Av. Carabobo)", address: "Av. Carabobo con Carrera 10", latitude: 7.7753666, longitude: -72.2312537, city: "San Cristóbal", region: "Táchira" },

  // Anzoátegui
  { id: 18, name: "IVOO Lechería (Av. Américo Vespucio)", address: "Av. Américo Vespucio, Lechería", latitude: 10.2004192, longitude: -64.6839732, city: "Lechería", region: "Anzoátegui" },
  { id: 19, name: "IVOO Puerto La Cruz", address: "Calle Bolívar, Puerto La Cruz", latitude: 10.2199796, longitude: -64.6409276, city: "Puerto La Cruz", region: "Anzoátegui" },
  { id: 20, name: "IVOO El Tigre", address: "Av. Francisco de Miranda, C.C. Petrucci", latitude: 8.8936662, longitude: -64.2425835, city: "El Tigre", region: "Anzoátegui" },

  // Nueva Esparta
  { id: 21, name: "IVOO Margarita (C.C. La Vela)", address: "C.C. La Vela, Nivel 2, Porlamar", latitude: 10.9767512, longitude: -63.8225519, city: "Margarita", region: "Nueva Esparta" },

  // Bolívar
  { id: 22, name: "IVOO Puerto Ordaz", address: "Villa Granada, Av. Estados Unidos", latitude: 8.3149605, longitude: -62.7265338, city: "Puerto Ordaz", region: "Bolívar" },

  // Monagas
  { id: 23, name: "IVOO Maturín", address: "Av. La Paz, Centro Maturín", latitude: 9.7406654, longitude: -63.1689814, city: "Maturín", region: "Monagas" },

  // Sucre
  { id: 24, name: "IVOO Cumaná", address: "Edif. Samir, Calle Mariño", latitude: 10.4637008, longitude: -64.1854782, city: "Cumaná", region: "Sucre" },

  // Portuguesa
  { id: 25, name: "IVOO Acarigua", address: "C.C. Llano Mall, PB", latitude: 9.5717288, longitude: -69.201191, city: "Acarigua", region: "Portuguesa" },

  // Barinas
  { id: 26, name: "IVOO Barinas", address: "Av. San Silvestre, Centro Financiero Atef", latitude: 8.6157496, longitude: -70.2551453, city: "Barinas", region: "Barinas" },

  // Trujillo
  { id: 27, name: "IVOO Valera", address: "C.C. Ideal, Av. 11", latitude: 9.3129735, longitude: -70.6122075, city: "Valera", region: "Trujillo" },

  // Carabobo
  { id: 28, name: "IVOO Puerto Cabello", address: "Av. La Paz, antiguo Locatel", latitude: 10.472484, longitude: -68.0390999, city: "Puerto Cabello", region: "Carabobo" },
];

export function getStoreById(id: number): Store | undefined {
  return STORES.find(store => store.id === id);
}

export function getAllStores(): Store[] {
  return STORES;
}

export function getStoresByCity(city: string): Store[] {
  return STORES.filter(store => store.city.toLowerCase() === city.toLowerCase());
}

export function getStoresByRegion(region: string): Store[] {
  return STORES.filter(store => store.region.toLowerCase() === region.toLowerCase());
}

export function validateStoreId(storeId: number): boolean {
  return STORES.some(store => store.id === storeId);
}
