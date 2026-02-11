import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: 'localhost',
  user: 'creditivoo_ordersuser',
  password: 'C4ed1t1voo',
  database: 'creditivoo_ivooApp',
};

async function testAuth() {
  try {
    console.log('\n🔐 TEST DE AUTENTICACIÓN\n');
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión a BD exitosa\n');

    // 1. Buscar usuario
    console.log('1️⃣  Buscando usuario admin@empresa.com...');
    const [users] = await connection.execute(
      'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
      ['admin@empresa.com']
    );

    if (users.length === 0) {
      console.log('❌ Usuario NO existe');
      console.log('\nInserta el usuario primero:');
      console.log(`INSERT INTO users (email, password_hash, full_name, role, phone, is_active) VALUES ('admin@empresa.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/KFm', 'Admin', 'admin', '+1234567890', TRUE);`);
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('✅ Usuario encontrado');
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Nombre: ${user.full_name}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Activo: ${user.is_active ? 'Sí ✓' : 'No ✗'}\n`);

    // 2. Verificar contraseña
    console.log('2️⃣  Verificando contraseña...');
    const testPassword = 'admin123';
    console.log(`  - Contraseña de prueba: ${testPassword}`);
    console.log(`  - Hash almacenado: ${user.password_hash.substring(0, 30)}...`);
    
    const passwordMatch = await bcrypt.compare(testPassword, user.password_hash);
    console.log(`  - Contraseña correcta: ${passwordMatch ? '✅ Sí' : '❌ No'}\n`);

    if (!passwordMatch) {
      console.log('❌ ERROR: La contraseña no coincide');
      console.log('Deberías:');
      console.log('1. Actualizar el hash en la BD');
      console.log('2. O usar la contraseña correcta para login');
      await connection.end();
      return;
    }

    // 3. Generar Bearer token
    console.log('3️⃣  Generando Bearer token...');
    const bearerToken = Buffer.from(`${user.email}:${testPassword}`).toString('base64');
    console.log(`  - Token: Bearer ${bearerToken}\n`);

    // 4. Resumen
    console.log('✅ AUTENTICACIÓN LISTA\n');
    console.log('Puedes hacer login con:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${testPassword}`);
    console.log('\nBrowser Console Test:');
    console.log(`
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: '${user.email}', 
    password: '${testPassword}' 
  }),
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log(d));
    `);

    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testAuth();
