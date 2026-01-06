const db = require('../config/database');

class DetailPesanan {
    // Ambil detail berdasarkan ID Pesanan
    static async getByPesanan(id_pesanan) {
        const sql = `
            SELECT d.*, m.nama_menu, m.harga, m.foto
            FROM detail_pesanan d
            JOIN menu m ON d.id_menu = m.id_menu
            WHERE d.id_pesanan = ?
        `;
        const [rows] = await db.query(sql, [id_pesanan]);
        return rows;
    }

    // Create Detail (Support Transaction)
    static async create(data, connection) {
        const sql = `
            INSERT INTO detail_pesanan (id_pesanan, id_menu, jumlah, catatan, status_masak)
            VALUES (?, ?, ?, ?, 'belum')
        `;
        await connection.execute(sql, [
            data.id_pesanan,
            data.id_menu,
            data.jumlah,
            data.catatan || null
        ]);
    }

    // Untuk Koki (Lihat item yg belum dimasak)
    static async getBelumMasak() {
        const sql = `
            SELECT dp.id_detail, p.id_pesanan, p.no_antrian, m.nama_menu, 
                   dp.jumlah, dp.status_masak, dp.catatan, p.nama_pemesan
            FROM detail_pesanan dp
            JOIN menu m ON dp.id_menu = m.id_menu
            JOIN pesanan p ON dp.id_pesanan = p.id_pesanan
            WHERE dp.status_masak IN ('belum', 'sedang')
            ORDER BY p.no_antrian ASC, dp.created_at ASC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }

    // Update Status Masak per Item
    static async updateStatusMasak(id_detail, status) {
        const sql = "UPDATE detail_pesanan SET status_masak = ? WHERE id_detail = ?";
        const [result] = await db.execute(sql, [status, id_detail]);
        return result;
    }
    // Update Status Masak untuk SEMUA item dalam satu pesanan (Fitur "Masak Semua" / "Selesai Semua")
    static async updateStatusByPesanan(id_pesanan, status) {
        const sql = "UPDATE detail_pesanan SET status_masak = ? WHERE id_pesanan = ?";
        const [result] = await db.execute(sql, [status, id_pesanan]);
        return result;
    }
}

module.exports = DetailPesanan;