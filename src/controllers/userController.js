const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Helper Auth: Hanya Admin yang boleh kelola User
const isAuthorized = (role) => {
    return role === 'admin';
};

exports.index = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak. Hanya admin." });

        const users = await User.all();
        
        // Hapus password dari output agar aman
        const safeUsers = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });

        res.status(200).json({ success: true, data: safeUsers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.show = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak." });

        const { id } = req.params;
        const user = await User.find(id);

        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const { password, ...safeUser } = user; // Sembunyikan password
        res.status(200).json({ success: true, data: safeUser });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.store = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak." });

        const { nama, gender, email, password, no_telp, role } = req.body;

        // Validasi
        if (!nama || !gender || !email || !password || !role) {
            return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        // Cek Email Duplikat
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email sudah digunakan" });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await User.create({
            nama, gender, email, no_telp, role,
            password: hashedPassword // Kirim password yang sudah di-hash
        });

        res.status(201).json({ success: true, message: "User berhasil ditambahkan", id: result });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak." });

        const { id } = req.params;
        const { nama, gender, email, password, no_telp, role } = req.body;

        const oldUser = await User.find(id);
        if (!oldUser) return res.status(404).json({ message: "User tidak ditemukan" });

        let newPassword = undefined;
        
        // Jika password diisi, hash password baru. Jika kosong, biarkan undefined (Logic di Model akan handle)
        if (password && password.trim() !== "") {
            newPassword = await bcrypt.hash(password, 10);
        }

        await User.update(id, {
            nama, gender, email, no_telp, role,
            password: newPassword
        });

        res.status(200).json({ success: true, message: "User berhasil diperbarui" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak." });

        const { id } = req.params;

        // Opsional: Cegah admin menghapus dirinya sendiri
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: "Anda tidak bisa menghapus akun sendiri saat sedang login." });
        }

        const result = await User.delete(id);
        if (result === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        res.status(200).json({ success: true, message: "User berhasil dihapus" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};