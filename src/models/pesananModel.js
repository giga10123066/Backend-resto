const db = require('../config/database');

class Pesanan {
    // Ambil semua pesanan (Join dengan Meja)
    static async all() {
        const sql = `
            SELECT p.*, m.no_meja 
            FROM pesanan p
            LEFT JOIN meja m ON p.id_meja = m.id_meja
            ORDER BY p.created_at DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Find by ID
    static async find(id) {
        const sql = `
            SELECT p.*, m.no_meja 
            FROM pesanan p
            LEFT JOIN meja m ON p.id_meja = m.id_meja
            WHERE p.id_pesanan = ?
        `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    // Hitung Nomor Antrian Berikutnya
    static async getNextAntrian() {
        const sql = "SELECT MAX(CAST(SUBSTRING(id_pesanan, 4) AS UNSIGNED)) as max_id FROM pesanan";
        const [rows] = await db.query(sql);
        // Jika max_id null, berarti pesanan pertama (return 1)
        // Logika PHP: ambil angka dari ID PSN005 -> 5. 
        // Disini kita ambil max antrian berdasarkan logika bisnis Anda (auto increment number)
        // Namun, jika Anda menyimpan no_antrian terpisah di kolom, lebih baik query max(no_antrian) hari ini.
        // Kita ikuti logika PHP Anda:
        return (rows[0].max_id || 0) + 1;
    }

    // Ambil ID terakhir (untuk mengambil ID hasil trigger)
    static async getLastId(connection = null) {
        const conn = connection || db; // Bisa pakai koneksi transaksi atau pool biasa
        const [rows] = await conn.query("SELECT id_pesanan FROM pesanan ORDER BY created_at DESC LIMIT 1");
        return rows.length > 0 ? rows[0].id_pesanan : null;
    }

    // Create Pesanan (Support Transaction)
    static async create(data, connection) {
        const sql = `
            INSERT INTO pesanan (nama_pemesan, no_antrian, id_meja, tipe_pesanan, status, status_pembayaran)
            VALUES (?, ?, ?, ?, ?, 'belum_dibayar')
        `;
        // Kita gunakan connection dari transaction, bukan pool global 'db'
        await connection.execute(sql, [
            data.nama_pemesan,
            data.no_antrian,
            data.id_meja || null,
            data.tipe_pesanan,
            'dalam antrian' // Default status
        ]);
    }

    // Update Status Pesanan
    static async updateStatus(id, status) {
        const sql = "UPDATE pesanan SET status = ? WHERE id_pesanan = ?";
        const [result] = await db.execute(sql, [status, id]);
        return result;
    }
    
    // Update Status Pembayaran
    static async updatePaymentStatus(id, status) {
        const sql = "UPDATE pesanan SET status_pembayaran = ? WHERE id_pesanan = ?";
        const [result] = await db.execute(sql, [status, id]);
        return result;
    }

    // Delete Pesanan
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM pesanan WHERE id_pesanan = ?", [id]);
        return result;
    }
    
    // Khusus Dashboard Kasir (Belum Dibayar & Selesai Masak)
    static async getOrdersForTransaction() {
        const sql = `
            SELECT 
                p.id_pesanan, p.nama_pemesan, p.no_antrian, p.tipe_pesanan, p.id_meja, 
                p.status, p.status_pembayaran, m.no_meja,
                SUM(dp.jumlah * mnu.harga) AS total_pesanan
            FROM pesanan p
            JOIN detail_pesanan dp ON p.id_pesanan = dp.id_pesanan
            JOIN menu mnu ON dp.id_menu = mnu.id_menu
            LEFT JOIN meja m ON p.id_meja = m.id_meja
            WHERE p.status = 'selesai' AND p.status_pembayaran = 'belum_dibayar'
            GROUP BY p.id_pesanan
            ORDER BY p.created_at ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
    
    // Dashboard Koki (Pesanan Aktif)
    static async getActiveOrders() {
        const sql = `
            SELECT p.*, m.no_meja
            FROM pesanan p
            LEFT JOIN meja m ON p.id_meja = m.id_meja
            WHERE p.status IN ('dalam antrian', 'sedang dimasak')
            ORDER BY p.no_antrian ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Hitung Total Pesanan
    static async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as total FROM pesanan");
        return rows[0].total;
    }

    // Aktivitas Terbaru (Dashboard Admin)
    static async getRecentActivities(limit = 5) {
        const [rows] = await db.query("SELECT nama_pemesan, created_at, status FROM pesanan ORDER BY created_at DESC LIMIT ?", [parseInt(limit)]);
        return rows;
    }
    
    // Pesanan Belum Dibayar (Dashboard Kasir)
    static async getBelumDibayar() {
        const sql = `
            SELECT p.*, m.no_meja 
            FROM pesanan p
            LEFT JOIN meja m ON p.id_meja = m.id_meja
            WHERE p.status_pembayaran = 'belum_dibayar' AND p.status != 'dibatalkan'
            ORDER BY p.created_at ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
}

module.exports = Pesanan;