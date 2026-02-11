import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'creditivoo_ordersuser',
  password: 'C4ed1t1voo',
  database: 'creditivoo_ivooApp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function verifyDatabase() {
  try {
    console.log('\n📊 VERIFICANDO CONEXIÓN A BASE DE DATOS\n');
    
    // Crear conexión
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a MySQL\n');

    // 1. Verificar que la tabla existe
    console.log('1️⃣  VERIFICANDO TABLA users...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, ['creditivoo_ivooApp']);
    
    if (tables.length === 0) {
      console.log('❌ La tabla "users" NO existe en la base de datos');
      console.log('\n⚠️  Por favor ejecuta primero: scripts/setup-users-auth.sql\n');
      return;
    }
    console.log('✅ Tabla "users" existe\n');

    // 2. Verificar estructura de la tabla
    console.log('2️⃣  VERIFICANDO ESTRUCTURA DE TABLA...');
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM users
    `);
    
    const columnNames = columns.map(c => c.Field);
    const requiredColumns = ['id', 'email', 'password_hash', 'full_name', 'role', 'is_active'];
    
    console.log('Columnas encontradas:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });
    console.log('');

    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    if (missingColumns.length > 0) {
      console.log(`❌ Faltan columnas: ${missingColumns.join(', ')}`);
      return;
    }
    console.log('✅ Todas las columnas requeridas existen\n');

    // 3. Verificar usuarios en la BD
    console.log('3️⃣  VERIFICANDO USUARIOS EN LA BD...');
    const [users] = await connection.execute(`
      SELECT id, email, full_name, role, is_active, created_at FROM users LIMIT 10
    `);
    
    if (users.length === 0) {
      console.log('❌ NO hay usuarios en la base de datos');
      console.log('\n⚠️  Debes insertar un usuario de prueba:');
      console.log('   - Email: admin@empresa.com');
      console.log('   - Password: admin123');
      console.log('\n   Ejecuta: mysql -h localhost -u creditivoo_ordersuser -pC4ed1t1voo creditivoo_ivooApp');
      console.log('   Luego pegua el contenido de: scripts/insert-test-user.sql\n');
    } else {
      console.log(`✅ ${users.length} usuario(s) encontrado(s):\n`);
      users.forEach(user => {
        const status = user.is_active ? '✓' : '✗';
        console.log(`  ${status} ${user.email} (${user.full_name}) - Role: ${user.role}`);
      });
      console.log('');
    }

    // 4. Verificar usuario admin específico
    console.log('4️⃣  BUSCANDO USUARIO admin@empresa.com...');
    const [adminUsers] = await connection.execute(`
      SELECT id, email, password_hash, full_name, role, is_active FROM users 
      WHERE email = 'admin@empresa.com'
    `);
    
    if (adminUsers.length === 0) {
      console.log('❌ Usuario admin@empresa.com NO existe\n');
      console.log('⚠️  Ejecuta este comando SQL:\n');
      console.log(`INSERT INTO users (email, password_hash, full_name, role, phone, is_active) 
VALUES ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Admin', 'admin', '+1234567890', TRUE);\n`);
    } else {
      const adminUser = adminUsers[0];
      console.log('✅ Usuario encontrado:');
      console.log(`  - Email: ${adminUser.email}`);
      console.log(`  - Nombre: ${adminUser.full_name}`);
      console.log(`  - Role: ${adminUser.role}`);
      console.log(`  - Activo: ${adminUser.is_active ? 'Sí' : 'No'}`);
      console.log(`  - Hash: ${adminUser.password_hash.substring(0, 20)}...`);
      console.log('');
      
      if (!adminUser.is_active) {
        console.log('⚠️  El usuario está INACTIVO. Actívalo con:');
        console.log('UPDATE users SET is_active = TRUE WHERE email = "admin@empresa.com";');
      } else {
        console.log('✅ El usuario está ACTIVO');
        console.log('\n📝 Intenta login con:');
        console.log('  - Email: admin@empresa.com');
        console.log('  - Password: admin123\n');
      }
    }

    // Cerrar conexión
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nVerifica tu DATABASE_URL en .env.local');
    process.exit(1);
  }
}

verifyDatabase();
