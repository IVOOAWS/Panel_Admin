import { NextRequest, NextResponse } from 'next/server';
import { inventoryQuery } from '@/lib/inventory-db';

interface ScanRequest {
  order_number?: string;
  scan_type: 'PICK' | 'PACK' | 'LOAD' | 'DELIVER';
  scanned_by: string;
  device_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScanRequest = await request.json();

    const { order_number, scan_type, scanned_by, device_id } = body;

    if (!order_number) {
      return NextResponse.json(
        { success: false, error: 'Order number required' },
        { status: 400 }
      );
    }

    // Find the order
    const orders = await inventoryQuery(
      'SELECT id, status_code FROM mirror_orders WHERE order_number = ?',
      [order_number]
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found', order_number },
        { status: 404 }
      );
    }

    const orderId = (orders[0] as any).id;
    const currentStatus = (orders[0] as any).status_code;

    // Get all order items
    const items = await inventoryQuery(
      'SELECT id, sku, name FROM mirror_order_items WHERE order_id = ?',
      [orderId]
    );

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items found for this order' },
        { status: 404 }
      );
    }

    // Insert scan records for all items
    const scanInserts = [];
    for (const item of items) {
      const query = `
        INSERT INTO mirror_item_scans 
        (order_item_id, barcode, qty_scanned, scan_type, scanned_by, device_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;
      scanInserts.push(
        inventoryQuery(query, [
          (item as any).id,
          (item as any).sku,
          1,
          scan_type,
          scanned_by,
          device_id,
        ])
      );
    }

    await Promise.all(scanInserts);

    // Update order status based on scan type
    let newStatus = currentStatus;
    if (scan_type === 'DELIVER') {
      newStatus = 'DELIVERED';
      
      // Insert status history record
      await inventoryQuery(
        `INSERT INTO mirror_status_history 
         (order_id, from_status, to_status, note, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [orderId, currentStatus, newStatus, `Order delivered by ${scanned_by}`]
      );

      // Update order status
      await inventoryQuery(
        'UPDATE mirror_orders SET status_code = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, orderId]
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${order_number} scanned successfully`,
      data: {
        order_id: orderId,
        order_number,
        items_count: items.length,
        scan_type,
        previous_status: currentStatus,
        new_status: newStatus,
        scanned_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error processing scan:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get('order_number');
    const limit = searchParams.get('limit') || '20';

    if (!orderNumber) {
      // Get recent scans
      const query = `
        SELECT 
          mis.*,
          poi.sku,
          poi.name as item_name,
          mo.order_number
        FROM mirror_item_scans mis
        JOIN mirror_order_items poi ON mis.order_item_id = poi.id
        JOIN mirror_orders mo ON poi.order_id = mo.id
        ORDER BY mis.created_at DESC
        LIMIT ?
      `;

      const scans = await inventoryQuery(query, [parseInt(limit)]);
      return NextResponse.json({
        success: true,
        data: scans,
      });
    }

    // Get order details with scans
    const orderQuery = `
      SELECT 
        mo.*,
        mc.full_name as customer_name,
        COUNT(DISTINCT moi.id) as total_items,
        COUNT(DISTINCT mis.id) as scanned_items
      FROM mirror_orders mo
      LEFT JOIN mirror_customers mc ON mo.customer_id = mc.id
      LEFT JOIN mirror_order_items moi ON mo.id = moi.order_id
      LEFT JOIN mirror_item_scans mis ON moi.id = mis.order_item_id
      WHERE mo.order_number = ?
      GROUP BY mo.id
    `;

    const orderDetails = await inventoryQuery(orderQuery, [orderNumber]);

    if (!orderDetails || orderDetails.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get all scans for this order
    const scansQuery = `
      SELECT mis.*
      FROM mirror_item_scans mis
      JOIN mirror_order_items moi ON mis.order_item_id = moi.id
      WHERE moi.order_id = (SELECT id FROM mirror_orders WHERE order_number = ?)
      ORDER BY mis.created_at DESC
    `;

    const scans = await inventoryQuery(scansQuery, [orderNumber]);

    return NextResponse.json({
      success: true,
      data: {
        order: orderDetails[0],
        scans,
      },
    });
  } catch (error: any) {
    console.error('Error fetching scan details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
