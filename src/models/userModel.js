const db = require('../config/database');

class User {
    // Ambil semua user
    static async all() {
        const [rows] = await db.query("SELECT * FROM users");
        return rows;
    }

    // Cari user by ID
    static async find(id) {
        const [rows] = await db.query("SELECT * FROM users WHERE id_user = ?", [id]);
        return rows[0];
    }

    // Cari user by Email (Penting untuk Login)
    static async findByEmail(email) {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows[0];
    }

    // Buat user baru (Register)
    static async create(data) {
        // Password di-hash di controller sebelum masuk sini, atau bisa juga disini. 
        // Tapi untuk konsistensi MVC, kita simpan query saja disini.
        const sql = `
            INSERT INTO users (nama, gender, email, password, no_telp, role, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const [result] = await db.execute(sql, [
            data.nama,
            data.gender,
            data.email,
            data.password, // Password sudah harus ter-hash saat dikirim kesini
            data.no_telp || null,
            data.role
        ]);
        return result.insertId;
    }

    // Update user
    static async update(id, data) {
        let sql = "UPDATE users SET nama = ?, gender = ?, email = ?, no_telp = ?, role = ?";
        const params = [data.nama, data.gender, data.email, data.no_telp || null, data.role];

        if (data.password) {
            sql += ", password = ?";
            params.push(data.password);
        }

        sql += ", updated_at = NOW() WHERE id_user = ?";
        params.push(id);

        const [result] = await db.execute(sql, params);
        return result.affectedRows;
    }

    // Hapus user
    static async delete(id) {
        const [result] = await db.execute("DELETE FROM users WHERE id_user = ?", [id]);
        return result.affectedRows;
    }

    // Filter by Role
    static async getAllByRole(role) {
        if (role) {
            const [rows] = await db.query("SELECT * FROM users WHERE role = ?", [role]);
            return rows;
        } else {
            return await this.all();
        }
    }

    // Count berdasarkan beberapa role (Logic PHP imploded array diterjemahkan)
    static async countByRole(roles) {
        if (!roles || roles.length === 0) return 0;
        
        // Buat tanda tanya sejumlah role (?, ?, ?)
        const placeholders = roles.map(() => '?').join(',');
        const sql = `SELECT COUNT(*) as total FROM users WHERE role IN (${placeholders})`;
        
        const [rows] = await db.query(sql, roles);
        return rows[0].total;
    }

    // Hitung User berdasarkan Role (bisa array role)
    static async countByRole(roles) {
        // roles = ['kasir', 'koki', 'pelayan']
        // Buat string placeholder (?, ?, ?)
        const placeholders = roles.map(() => '?').join(',');
        const sql = `SELECT COUNT(*) as total FROM users WHERE role IN (${placeholders})`;
        const [rows] = await db.query(sql, roles);
        return rows[0].total;
    }
}

module.exports = User;