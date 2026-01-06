const db = require('../config/database');

class Meja {
    // Ambil semua meja
    static async all() {
        const [rows] = await db.query("SELECT * FROM meja ORDER BY no_meja ASC");
        return rows;
    }

    // Cari meja by ID (Primary Key)
    static async find(id) {
        const [rows] = await db.query("SELECT * FROM meja WHERE id_meja = ?", [id]);
        return rows[0];
    }

    // Cari meja by Nomor Meja (Untuk cek duplikat)
    static async findByNoMeja(no_meja) {
        const [rows] = await db.query("SELECT * FROM meja WHERE no_meja = ?", [no_meja]);
        return rows[0];
    }

    // Ambil meja yang Statusnya 'tersedia' (Penting untuk Dropdown di Flutter)
    static async getTersedia() {
        const [rows] = await db.query("SELECT * FROM meja WHERE status = 'tersedia' ORDER BY no_meja ASC");
        return rows;
    }

    // Create Meja Baru
    static async create(data) {
        // ID digenerate oleh Trigger Database (MJxxx)
        const sql = "INSERT INTO meja (no_meja, status, kapasitas) VALUES (?, ?, ?)";
        const [result] = await db.execute(sql, [
            data.no_meja,
            data.status,
            data.kapasitas
        ]);
        return result;
    }

    // Ambil ID terakhir yang baru saja diinsert (Workaround Trigger)
    static async getLastId() {
        const [rows] = await db.query("SELECT id_meja FROM meja ORDER BY created_at DESC LIMIT 1");
        return rows.length > 0 ? rows[0].id_meja : null;
    }

    // Update Meja
    static async update(id, data) {
        const sql = "UPDATE meja SET no_meja = ?, status = ?, kapasitas = ? WHERE id_meja = ?";
        const [result] = await db.execute(sql, [
            data.no_meja,
            data.status,
            data.kapasitas,
            id
        ]);
        return result;
    }

    // Update Status Saja (Helper cepat untuk controller Pesanan nanti)
    static async updateStatus(id, status) {
        const sql = "UPDATE meja SET status = ? WHERE id_meja = ?";
        const [result] = await db.execute(sql, [status, id]);
        return result;
    }

    // Delete Meja
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM meja WHERE id_meja = ?", [id]);
        return result;
    }
}

module.exports = Meja;