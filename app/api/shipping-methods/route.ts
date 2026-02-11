import { NextRequest, NextResponse } from 'next/server';
import {
  SHIPPING_METHODS,
  toggleShippingMethod,
  getEnabledShippingMethods,
} from '@/lib/payment-shipping-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enabled = searchParams.get('enabled');

    let methods = SHIPPING_METHODS;

    if (enabled === 'true') {
      methods = getEnabledShippingMethods();
    }

    // In production, this would call your IVOOAPP backend API:
    // const response = await fetch(`${process.env.IVOOAPP_API_URL}/shipping-methods`, {
    //   headers: {
    //     Authorization: `Bearer ${process.env.IVOOAPP_API_KEY}`,
    //   },
    // });
    // const methods = await response.json();

    return NextResponse.json({
      success: true,
      data: methods,
      total: methods.length,
    });
  } catch (error) {
    console.error('[API] Error fetching shipping methods:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching shipping methods' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isEnabled } = body;

    if (!id || typeof isEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    const updatedMethod = toggleShippingMethod(id, isEnabled);

    if (!updatedMethod) {
      return NextResponse.json(
        { success: false, error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    // In production, this would call your IVOOAPP backend API:
    // const response = await fetch(
    //   `${process.env.IVOOAPP_API_URL}/shipping-methods/${id}`,
    //   {
    //     method: 'PATCH',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${process.env.IVOOAPP_API_KEY}`,
    //     },
    //     body: JSON.stringify({ isEnabled }),
    //   }
    // );
    // const updated = await response.json();

    return NextResponse.json({
      success: true,
      message: `Shipping method ${isEnabled ? 'enabled' : 'disabled'} successfully`,
      data: updatedMethod,
    });
  } catch (error) {
    console.error('[API] Error updating shipping method:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating shipping method' },
      { status: 500 }
    );
  }
}
