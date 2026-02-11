import { NextResponse } from 'next/server';
import { inventoryQuery } from '@/lib/inventory-db';

export async function GET() {
  try {
    const query = `
      SELECT 
        mo.id,
        mo.order_number,
        mc.full_name as customer_name,
        mo.status_code,
        COUNT(moi.id) as items_count,
        mo.created_at
      FROM mirror_orders mo
      LEFT JOIN mirror_customers mc ON mo.customer_id = mc.id
      LEFT JOIN mirror_order_items moi ON mo.id = moi.order_id
      WHERE mo.status_code NOT IN ('DELIVERED', 'CANCELLED')
      GROUP BY mo.id, mo.order_number, mc.full_name, mo.status_code, mo.created_at
      ORDER BY mo.created_at DESC
      LIMIT 100
    `;

    const orders = await inventoryQuery(query);

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
