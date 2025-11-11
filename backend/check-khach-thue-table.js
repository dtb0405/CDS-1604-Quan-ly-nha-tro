const db = require('./config/database');

(async () => {
    try {
        const [cols] = await db.query('DESCRIBE khach_thue');
        console.log('📋 Cấu trúc bảng khach_thue:');
        console.table(cols);
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
})();
