import { NextRequest, NextResponse } from 'next/server';
import { inventoryQuery } from '@/lib/inventory-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('end_date') || new Date().toISOString().split('T')[0];
    const scanType = searchParams.get('scan_type');

    let baseQuery = `
      SELECT 
        COUNT(DISTINCT mis.id) as total_scans,
        COUNT(DISTINCT mis.order_item_id) as total_items_scanned,
        COUNT(DISTINCT poi.order_id) as total_orders,
        mis.scan_type,
        DATE(mis.created_at) as scan_date
      FROM mirror_item_scans mis
      JOIN mirror_order_items poi ON mis.order_item_id = poi.id
      WHERE DATE(mis.created_at) BETWEEN ? AND ?
    `;

    const params: any[] = [startDate, endDate];

    if (scanType) {
      baseQuery += ' AND mis.scan_type = ?';
      params.push(scanType);
    }

    baseQuery += ' GROUP BY mis.scan_type, scan_date ORDER BY scan_date DESC';

    const scans = await inventoryQuery(baseQuery, params);

    // Get recent scans detail
    let recentQuery = `
      SELECT 
        mis.*,
        poi.sku,
        poi.name as item_name,
        mo.order_number
      FROM mirror_item_scans mis
      JOIN mirror_order_items poi ON mis.order_item_id = poi.id
      JOIN mirror_orders mo ON poi.order_id = mo.id
      WHERE DATE(mis.created_at) BETWEEN ? AND ?
    `;

    const recentParams: any[] = [startDate, endDate];

    if (scanType) {
      recentQuery += ' AND mis.scan_type = ?';
      recentParams.push(scanType);
    }

    recentQuery += ' ORDER BY mis.created_at DESC LIMIT 50';

    const recent = await inventoryQuery(recentQuery, recentParams);

    // Get scan type summary
    const summaryQuery = `
      SELECT 
        mis.scan_type,
        COUNT(*) as count
      FROM mirror_item_scans mis
      WHERE DATE(mis.created_at) BETWEEN ? AND ?
      GROUP BY mis.scan_type
    `;

    const summary = await inventoryQuery(summaryQuery, [startDate, endDate]);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        scans,
        recent,
        date_range: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching inventory reports:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
