// app/api/yummy/route.ts
import { NextResponse } from 'next/server';

// ⚠️ SUSTITUYE ESTA CADENA POR LA LLAVE REAL QUE TE DIÓ YUMMY
const YUMMY_API_KEY = "TU_API_KEY_REAL_AQUI"; 
const BASE_URL = "https://api.yummyrides.com";

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    let endpoint = "";
    let method = "POST";

    switch (action) {
      case 'createTrip': endpoint = "/api/v1/trip/api-corporate"; break;
      case 'cancelTrip': endpoint = "/api/v1/trip/external-cancel-trip"; break;
      case 'getTrips': endpoint = "/api/v2/trip/get-trips-by-corporate-api"; break;
      case 'getStatus': 
        endpoint = `/api/v1/trip/api-status-by-corporate/${data.tripId}`; 
        method = "GET";
        break;
    }

    const options: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': YUMMY_API_KEY, // Este header es el que está fallando
        'language': 'es'
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error de conexión' }, { status: 500 });
  }
}