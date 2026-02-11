import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // In production, fetch from IVOOAPP:
    // const response = await fetch(`${process.env.IVOOAPP_API_URL}/orders/${id}`, {
    //   headers: {
    //     Authorization: `Bearer ${process.env.IVOOAPP_API_KEY}`,
    //   },
    // });
    // const order = await response.json();

    // Mock data
    const mockOrders: Record<string, any> = {
      '1': {
        id: '1',
        orderNumber: '73956361',
        trackingNumber: 'CS-0004722402601300856042736593',
        sender: { name: 'IVOO Comercio', code: 'J 3500269358' },
        receiver: { name: 'Customer Name', phone: '+5841234567' },
      },
    };

    const order = mockOrders[id];

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('[API] Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching order' },
      { status: 500 }
    );
  }
}
