const db = require('../config/database');

class Reservasi {
    // Ambil semua reservasi
    static async all() {
        const sql = "SELECT * FROM reservasi ORDER BY tanggal DESC, waktu DESC";
        const [rows] = await db.query(sql);
        return rows;
    }

    // Cari by ID
    static async find(id) {
        const sql = "SELECT * FROM reservasi WHERE id_reservasi = ?";
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    // Reservasi Mendatang (Upcoming)
    static async getUpcoming(limit = 5) {
        const sql = `
            SELECT * FROM reservasi 
            WHERE (status = 'pending' OR status = 'disetujui') AND tanggal >= CURDATE()
            ORDER BY tanggal ASC, waktu ASC
            LIMIT ?
        `;
        // pastikan limit di-casting ke integer agar tidak error di prepared statement
        const [rows] = await db.query(sql, [parseInt(limit)]);
        return rows;
    }

    // Create Reservasi (Support Transaction)
    static async create(data, connection) {
        const sql = `
            INSERT INTO reservasi 
            (nama_pemesan, no_telp, jml_orang, catatan, tanggal, waktu, status, id_pesanan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.execute(sql, [
            data.nama_pemesan,
            data.no_telp,
            data.jml_orang,
            data.catatan || null,
            data.tanggal,
            data.waktu,
            data.status || 'pending',
            data.id_pesanan || null
        ]);
    }

    // Ambil ID Terakhir (Workaround Trigger)
    static async getLastId(connection) {
        const conn = connection || db;
        const [rows] = await conn.query("SELECT id_reservasi FROM reservasi ORDER BY created_at DESC LIMIT 1");
        return rows.length > 0 ? rows[0].id_reservasi : null;
    }

    // Update Reservasi (Support Transaction)
    static async update(id, data, connection) {
        const conn = connection || db;
        const sql = `
            UPDATE reservasi
            SET nama_pemesan = ?, no_telp = ?, jml_orang = ?, catatan = ?, 
                tanggal = ?, waktu = ?, status = ?, id_pesanan = ?
            WHERE id_reservasi = ?
        `;
        const [result] = await conn.execute(sql, [
            data.nama_pemesan,
            data.no_telp,
            data.jml_orang,
            data.catatan || null,
            data.tanggal,
            data.waktu,
            data.status,
            data.id_pesanan || null,
            id
        ]);
        return result;
    }

    // Delete Reservasi (Support Transaction)
    static async delete(id, connection) {
        const conn = connection || db;
        const [result] = await conn.execute("DELETE FROM reservasi WHERE id_reservasi = ?", [id]);
        return result;
    }
}

module.exports = Reservasi;