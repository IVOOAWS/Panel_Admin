import { NextRequest, NextResponse } from 'next/server';
import { getAllStores, getStoreById, getStoresByCity, getStoresByRegion, validateStoreId } from '@/lib/stores-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const city = searchParams.get('city');
    const region = searchParams.get('region');

    let stores;

    if (id) {
      const store = getStoreById(parseInt(id));
      stores = store ? [store] : [];
    } else if (city) {
      stores = getStoresByCity(city);
    } else if (region) {
      stores = getStoresByRegion(region);
    } else {
      stores = getAllStores();
    }

    return NextResponse.json({
      success: true,
      data: stores,
      total: stores.length,
    });
  } catch (error) {
    console.error('[API] Error fetching stores:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching stores' },
      { status: 500 }
    );
  }
}
