// app/api/yummy/route.ts
import { NextResponse } from 'next/server';

const YUMMY_API_KEY = "603179be-e09f-4cee-8026-0a241ab9c3d1"; 
const BASE_URL = "https://api.yummyrides.com";
const CORPORATE_ID = "6978e869044548e89ffa6f33";

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    let endpoint = "";
    let method = "POST";
    let bodyData = { ...data };

    switch (action) {
      case 'createQuotation': 
        endpoint = "/api/v1/quotation/api-corporate";
        // La cotización solo necesita coordenadas, el corporate_id a veces causa error 400 aquí
        break;
      case 'createTrip': 
        endpoint = "/api/v1/trip/api-corporate"; 
        // CAMBIO AQUÍ: La API de creación espera 'payerId'
        bodyData.payerId = CORPORATE_ID; 
        break;
      case 'getTrips': 
        endpoint = "/api/v1/trip/get-trips-by-corporate-api"; 
        bodyData.corporate_id = CORPORATE_ID;
        break;
      case 'getStatus': 
        endpoint = `/api/v1/trip/api-status-by-corporate/${data.tripId}`; 
        method = "GET";
        break;
      case 'cancelTrip': 
        endpoint = "/api/v1/trip/external-cancel-trip";
        // IMPORTANTE: Esta API requiere el ID de MongoDB (ej: 62ebf843...) 
        // y el motivo de cancelación
        bodyData = {
          tripId: data.tripId, 
          cancelReason: data.cancelReason || "OC" // "OC" es el código de ejemplo de la documentación
        };
        break;
      default:
        return NextResponse.json({ success: false, message: "Acción no reconocida" }, { status: 400 });
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': YUMMY_API_KEY,
        'language': 'es'
      },
      body: method === 'POST' ? JSON.stringify(bodyData) : undefined
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error de conexión con Yummy' }, { status: 500 });
  }
}