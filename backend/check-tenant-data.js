const db = require('./config/database');

(async () => {
    try {
        console.log('🔍 Kiểm tra dữ liệu người dùng khách thuê...\n');
        
        // Lấy danh sách user là khách thuê
        const [users] = await db.query(`
            SELECT id_nguoi_dung, ho_ten, email, loai_nguoi_dung 
            FROM nguoi_dung 
            WHERE loai_nguoi_dung = 'khach_thue'
        `);
        
        console.log('👥 Danh sách User khách thuê:');
        console.table(users);
        
        // Lấy danh sách khách thuê (có gán phòng)
        const [tenants] = await db.query(`
            SELECT 
                kt.id_khach_thue,
                kt.id_nguoi_dung,
                kt.id_phong,
                nd.ho_ten,
                nd.email,
                p.ten_phong,
                kt.ngay_vao,
                kt.trang_thai
            FROM khach_thue kt
            JOIN nguoi_dung nd ON kt.id_nguoi_dung = nd.id_nguoi_dung
            LEFT JOIN phong p ON kt.id_phong = p.id_phong
        `);
        
        console.log('\n🏠 Danh sách khách thuê (có trong bảng khach_thue):');
        console.table(tenants);
        
        if (users.length > 0 && tenants.length === 0) {
            console.log('\n⚠️ CÓ USER NHƯNG CHƯA CÓ RECORD TRONG BẢNG KHACH_THUE!');
            console.log('💡 Giải pháp: Admin cần vào trang "Quản lý khách thuê" để thêm khách thuê và gán phòng.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
})();
