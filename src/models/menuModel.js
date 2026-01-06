const db = require('../config/database');

class Menu {
    // Ambil semua menu (PHP: Menu->all)
    static async all() {
        const [rows] = await db.query("SELECT * FROM menu ORDER BY nama_menu ASC");
        return rows;
    }

    // Cari menu by ID
    static async find(id) {
        const [rows] = await db.query("SELECT * FROM menu WHERE id_menu = ?", [id]);
        return rows[0];
    }

    // Create Menu
    static async create(data) {
        const sql = `
            INSERT INTO menu (nama_menu, harga, deskripsi, foto, status, kategori) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.nama_menu,
            data.harga,
            data.deskripsi,
            data.foto,     // Filename atau null
            data.status,
            data.kategori
        ]);
        return result;
    }

    // Ambil ID terakhir (Penting karena Trigger Database yang generate ID)
    static async getLastId() {
        const [rows] = await db.query("SELECT id_menu FROM menu ORDER BY created_at DESC LIMIT 1");
        return rows.length > 0 ? rows[0].id_menu : null;
    }

    // Update Menu
    static async update(id, data) {
        let sql = "UPDATE menu SET nama_menu = ?, harga = ?, deskripsi = ?, status = ?, kategori = ?";
        const params = [data.nama_menu, data.harga, data.deskripsi, data.status, data.kategori];

        // Jika ada foto baru atau perintah hapus foto, update kolom foto
        if (data.foto !== undefined) { 
            sql += ", foto = ?";
            params.push(data.foto);
        }

        sql += " WHERE id_menu = ?";
        params.push(id);

        const [result] = await db.execute(sql, params);
        return result;
    }

    // Delete Menu
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM menu WHERE id_menu = ?", [id]);
        return result;
    }

    // === AREA BAHAN MENU (Integrasi logic BahanMenu.php) ===
    
    // Insert Bahan untuk Menu tertentu
    static async addBahan(id_menu, id_stok, jumlah, satuan) {
        const sql = "INSERT INTO bahan_menu (id_menu, id_stok, jumlah, satuan) VALUES (?, ?, ?, ?)"; // Trigger akan handle id_bahan_menu
        await db.execute(sql, [id_menu, id_stok, jumlah, satuan]);
    }

    // Hapus semua bahan di menu tertentu (dipakai saat Update/Reset resep)
    static async deleteBahanByMenu(id_menu) {
        await db.execute("DELETE FROM bahan_menu WHERE id_menu = ?", [id_menu]);
    }

    // Ambil bahan untuk detail menu
    static async getBahanByMenu(id_menu) {
        // Join ke stok_bahan untuk ambil nama bahannya sekalian
        const sql = `
            SELECT bm.*, sb.nama_bahan 
            FROM bahan_menu bm
            JOIN stok_bahan sb ON bm.id_stok = sb.id_stok
            WHERE bm.id_menu = ?
        `;
        const [rows] = await db.query(sql, [id_menu]);
        return rows;
    }

    static async getAvailable() {
        const sql = "SELECT * FROM menu WHERE status = 'tersedia' ORDER BY kategori ASC, nama_menu ASC";
        const [rows] = await db.query(sql);
        return rows;
    }
    // Hitung Total Menu
    static async countAll() {
        const [rows] = await db.query("SELECT COUNT(*) as total FROM menu");
        return rows[0].total;
    }

    // Get Menu List (Khusus Koki - biasanya untuk cek menu yg habis/tidak tersedia)
    static async getUnavailable() {
        const [rows] = await db.query("SELECT * FROM menu WHERE status = 'tidak tersedia' ORDER BY nama_menu ASC");
        return rows;
    }
}

module.exports = Menu;