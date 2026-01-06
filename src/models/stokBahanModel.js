const db = require('../config/database');

class StokBahan {
    // Ambil semua stok (PHP: all)
    static async all() {
        const [rows] = await db.query("SELECT * FROM stok_bahan ORDER BY nama_bahan ASC");
        return rows;
    }

    // Ambil stok yang tersedia (PHP: allAvailable)
    static async allAvailable() {
        const [rows] = await db.query("SELECT * FROM stok_bahan WHERE status != 'habis' ORDER BY nama_bahan ASC");
        return rows;
    }

    // Cari by ID (PHP: find)
    static async find(id) {
        const [rows] = await db.query("SELECT * FROM stok_bahan WHERE id_stok = ?", [id]);
        return rows[0];
    }

    // Ambil stok yang menipis (PHP: getLowStock)
    static async getLowStock() {
        const sql = "SELECT * FROM stok_bahan WHERE status IN ('hampir habis', 'habis') ORDER BY status DESC, nama_bahan ASC";
        const [rows] = await db.query(sql);
        return rows;
    }

    // Create Stok Baru
    static async create(data) {
        // created_at & updated_at dihandle database/trigger
        const sql = `
            INSERT INTO stok_bahan (nama_bahan, jumlah_stok, satuan, jenis, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.nama_bahan,
            data.jumlah_stok,
            data.satuan,
            data.jenis,
            data.status
        ]);
        return result;
    }

    // Ambil ID terakhir (Penting karena Trigger yang buat ID)
    static async getLastId() {
        const [rows] = await db.query("SELECT id_stok FROM stok_bahan ORDER BY created_at DESC LIMIT 1");
        return rows.length > 0 ? rows[0].id_stok : null;
    }

    // Update Stok
    static async update(id, data) {
        const sql = `
            UPDATE stok_bahan
            SET nama_bahan = ?, jumlah_stok = ?, satuan = ?, jenis = ?, status = ?
            WHERE id_stok = ?
        `;
        const [result] = await db.execute(sql, [
            data.nama_bahan,
            data.jumlah_stok,
            data.satuan,
            data.jenis,
            data.status,
            id
        ]);
        return result;
    }

    // Delete Stok
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM stok_bahan WHERE id_stok = ?", [id]);
        return result;
    }
}

module.exports = StokBahan;