const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigrations() {
  let connection;
  
  try {
    console.log('🔄 Kết nối đến database...');
    
    // Tạo kết nối
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true
    });
    
    console.log('✅ Kết nối database thành công!');
    
    // Đọc thư mục migrations
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Chạy theo thứ tự alphabet/date
    
    console.log(`\n📁 Tìm thấy ${files.length} file migration:\n`);
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`⏳ Đang chạy: ${file}...`);
      
      try {
        await connection.query(sql);
        console.log(`   ✅ Thành công: ${file}\n`);
      } catch (error) {
        // Nếu lỗi là "Duplicate column", bỏ qua
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`   ⚠️  Bỏ qua (cột đã tồn tại): ${file}\n`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('🎉 Hoàn thành tất cả migrations!\n');
    
  } catch (error) {
    console.error('❌ Lỗi khi chạy migration:', error.message);
    if (error.sql) {
      console.error('SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Đã đóng kết nối database.');
    }
  }
}

// Chạy migrations
runMigrations();
