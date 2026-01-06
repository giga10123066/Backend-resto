const db = require('../config/database');

class BahanMenu {
    // Ambil bahan detail (Join ke Stok) untuk Menu tertentu
    static async getByMenu(id_menu) {
        const sql = `
            SELECT bm.*, sb.nama_bahan, sb.jumlah_stok, sb.satuan AS satuan_stok
            FROM bahan_menu bm
            JOIN stok_bahan sb ON sb.id_stok = bm.id_stok
            WHERE bm.id_menu = ?
        `;
        const [rows] = await db.query(sql, [id_menu]);
        return rows;
    }

    // Tambah bahan baru ke menu
    static async create(data) {
        // Trigger database akan handle ID unik jika ada kolom primary key id_bahan_menu
        const sql = `
            INSERT INTO bahan_menu (id_menu, id_stok, jumlah, satuan)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.id_menu,
            data.id_stok,
            data.jumlah,
            data.satuan
        ]);
        return result;
    }

    // Hapus semua bahan di menu tertentu (Clean up)
    static async deleteByMenu(id_menu) {
        const [result] = await db.execute("DELETE FROM bahan_menu WHERE id_menu = ?", [id_menu]);
        return result;
    }

    // Hapus 1 bahan spesifik dari menu
    static async deleteByMenuAndStok(id_menu, id_stok) {
        const sql = "DELETE FROM bahan_menu WHERE id_menu = ? AND id_stok = ?";
        const [result] = await db.execute(sql, [id_menu, id_stok]);
        return result;
    }
}

module.exports = BahanMenu;