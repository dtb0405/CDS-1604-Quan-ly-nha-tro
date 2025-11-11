const db = require('./config/database');

(async () => {
    try {
        const id_nguoi_dung = 2; // User1
        
        console.log('🔍 Testing API query for id_nguoi_dung:', id_nguoi_dung);
        
        const [khachThues] = await db.query(`
            SELECT 
                kt.*,
                p.id_phong,
                p.ten_phong,
                p.dien_tich,
                CAST(p.gia_thue AS DECIMAL(15,2)) as gia_thue_phong,
                CAST(p.tien_dich_vu AS DECIMAL(15,2)) as tien_dich_vu,
                p.dich_vu_bao_gom,
                p.trang_thai as trang_thai_phong,
                p.mo_ta,
                nd_chu_tro.ho_ten as ten_chu_tro,
                nd_chu_tro.so_dien_thoai as sdt_chu_tro,
                nd_chu_tro.email as email_chu_tro,
                CAST(hd.tien_coc AS DECIMAL(15,2)) as tien_coc,
                CAST(hd.gia_thue AS DECIMAL(15,2)) as gia_thue_hd,
                hd.ngay_bat_dau,
                hd.ngay_ket_thuc,
                hd.trang_thai as trang_thai_hop_dong,
                CAST(COALESCE(dn.gia_dien, 3500) AS DECIMAL(10,2)) as gia_dien,
                CAST(COALESCE(dn.gia_nuoc, 20000) AS DECIMAL(10,2)) as gia_nuoc
            FROM khach_thue kt
            LEFT JOIN phong p ON kt.id_phong = p.id_phong
            LEFT JOIN nguoi_dung nd_chu_tro ON p.id_chu_tro = nd_chu_tro.id_nguoi_dung
            LEFT JOIN hop_dong hd ON kt.id_khach_thue = hd.id_khach_thue 
                AND hd.trang_thai = 'hieu_luc'
            LEFT JOIN (
                SELECT id_phong, gia_dien, gia_nuoc
                FROM dien_nuoc
                WHERE (id_phong, ngay_tao) IN (
                    SELECT id_phong, MAX(ngay_tao)
                    FROM dien_nuoc
                    GROUP BY id_phong
                )
            ) dn ON p.id_phong = dn.id_phong
            WHERE kt.id_nguoi_dung = ?
            ORDER BY kt.ngay_tao DESC
            LIMIT 1
        `, [id_nguoi_dung]);
        
        console.log('\n✅ Query result:');
        console.table(khachThues);
        
        if (khachThues.length > 0) {
            console.log('\n📋 Chi tiết đầy đủ:');
            console.log(JSON.stringify(khachThues[0], null, 2));
        } else {
            console.log('\n⚠️ Không tìm thấy dữ liệu!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
})();
