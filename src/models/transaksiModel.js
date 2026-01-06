const db = require('../config/database');

class Transaksi {
    // Ambil semua riwayat transaksi (Join ke User & Pesanan untuk detail lengkap)
    static async all() {
        const sql = `
            SELECT t.*,
                   u.nama AS kasir,
                   p.nama_pemesan,
                   p.no_antrian,
                   p.status AS status_pesanan,
                   p.status_pembayaran
            FROM detail_transaksi t
            JOIN users u ON t.id_user = u.id_user
            JOIN pesanan p ON t.id_pesanan = p.id_pesanan
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Cari by ID
    static async find(id) {
        const sql = "SELECT * FROM detail_transaksi WHERE id_transaksi = ?";
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    // Create Transaksi (Support Transaction)
    // ID Transaksi (TRxxx) digenerate otomatis oleh Trigger Database
    static async create(data, connection) {
        const sql = `
            INSERT INTO detail_transaksi (id_user, id_pesanan, metode_pembayaran, total, diskon, kembalian)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(sql, [
            data.id_user,
            data.id_pesanan,
            data.metode_pembayaran,
            data.total,
            data.diskon,
            data.kembalian
        ]);
    }

    // Ambil ID Terakhir (Workaround Trigger)
    static async getLastId(connection) {
        const conn = connection || db;
        const [rows] = await conn.query("SELECT id_transaksi FROM detail_transaksi ORDER BY created_at DESC LIMIT 1");
        return rows.length > 0 ? rows[0].id_transaksi : null;
    }

    // Laporan / Rekap Harian
    static async getRekap(awal, akhir) {
        let sql = "SELECT * FROM detail_transaksi WHERE 1=1";
        const params = [];
        if (awal && akhir) {
            sql += " AND DATE(created_at) BETWEEN ? AND ?";
            params.push(awal, akhir);
        }
        
        const [rows] = await db.query(sql, params);

        // Hitung total di sisi backend JS (atau bisa pakai SUM() di SQL, tapi ini meniru logika PHP array_sum Anda)
        const summary = {
            jumlah_transaksi: rows.length,
            total: rows.reduce((sum, item) => sum + parseFloat(item.total), 0),
            diskon: rows.reduce((sum, item) => sum + parseFloat(item.diskon), 0),
            kembalian: rows.reduce((sum, item) => sum + parseFloat(item.kembalian), 0),
            data: rows
        };
        return summary;
    }
    // Filter Laporan untuk Export/View (Date Range + User Filter)
    static async filterLaporan(start, end, id_user = null) {
        let sql = `
            SELECT t.*, u.nama AS nama_user, p.nama_pemesan, p.no_antrian, p.tipe_pesanan 
            FROM detail_transaksi t
            JOIN users u ON t.id_user = u.id_user
            JOIN pesanan p ON t.id_pesanan = p.id_pesanan
            WHERE DATE(t.created_at) BETWEEN ? AND ?
        `;
        
        const params = [start, end];

        if (id_user) {
            sql += " AND t.id_user = ?";
            params.push(id_user);
        }

        sql += " ORDER BY t.created_at DESC";

        const [rows] = await db.query(sql, params);
        return rows;
    }
    // --- DASHBOARD ADMIN ---
    
    // Total Pendapatan Hari Ini
    static async getRevenueToday() {
        const [rows] = await db.query("SELECT SUM(total) as total FROM detail_transaksi WHERE DATE(created_at) = CURDATE()");
        return rows[0].total || 0;
    }

    // Total Pendapatan Minggu Ini
    static async getRevenueWeek() {
        const [rows] = await db.query("SELECT SUM(total) as total FROM detail_transaksi WHERE YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");
        return rows[0].total || 0;
    }

    // Total Pendapatan Bulan Ini
    static async getRevenueMonth() {
        const [rows] = await db.query("SELECT SUM(total) as total FROM detail_transaksi WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
        return rows[0].total || 0;
    }

    // Total Pendapatan Keseluruhan
    static async getTotalRevenue() {
        const [rows] = await db.query("SELECT SUM(total) as total FROM detail_transaksi");
        return rows[0].total || 0;
    }

    // Data Chart (7 Hari Terakhir)
    static async getRevenueChartData(days = 7) {
        const sql = `
            SELECT DATE(created_at) as tanggal, SUM(total) as total
            FROM detail_transaksi
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY tanggal ASC
        `;
        const [rows] = await db.query(sql, [days]);
        return rows;
    }

    // Hitung Total Transaksi
    static async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as total FROM detail_transaksi");
        return rows[0].total;
    }

    // --- DASHBOARD KASIR ---

    // Pendapatan Kasir Tertentu Hari Ini
    static async getRevenueByKasirToday(id_user) {
        const sql = "SELECT SUM(total) as total FROM detail_transaksi WHERE id_user = ? AND DATE(created_at) = CURDATE()";
        const [rows] = await db.query(sql, [id_user]);
        return rows[0].total || 0;
    }

    // Transaksi Terakhir Kasir Tertentu
    static async getRecentByKasir(id_user, limit = 5) {
        const sql = "SELECT id_transaksi, total, created_at FROM detail_transaksi WHERE id_user = ? ORDER BY created_at DESC LIMIT ?";
        // Parse limit ke integer
        const [rows] = await db.query(sql, [id_user, parseInt(limit)]);
        return rows;
    }
}

module.exports = Transaksi;