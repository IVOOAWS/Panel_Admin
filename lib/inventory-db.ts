import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.INVENTORY_DB_HOST || 'localhost',
  user: process.env.INVENTORY_DB_USER || 'root',
  password: process.env.INVENTORY_DB_PASSWORD || '',
  database: process.env.INVENTORY_DB_NAME || 'paneldelivery',
  port: parseInt(process.env.INVENTORY_DB_PORT || '3306'),
  connectionLimit: 10,
});

export async function getInventoryConnection() {
  return await pool.getConnection();
}

export async function inventoryQuery(sql: string, values?: any[]) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    return results;
  } finally {
    connection.release();
  }
}

export interface ItemScan {
  id: number;
  order_item_id: number;
  barcode: string;
  qty_scanned: number;
  scan_type: 'PICK' | 'PACK' | 'LOAD' | 'DELIVER';
  scanned_by: string;
  device_id: string;
  created_at: string;
}

export interface InventoryReport {
  total_items_scanned: number;
  total_orders: number;
  scan_types: Record<string, number>;
  items_by_status: Record<string, number>;
  recent_scans: ItemScan[];
  date_range: {
    start: string;
    end: string;
  };
}
