const Meja = require('../models/mejaModel');

// Helper: Cek Role (Admin atau Pelayan)
const isAuthorized = (role) => {
    return role === 'admin' || role === 'pelayan';
};

exports.index = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak. Hanya admin & pelayan." });
        }

        const meja = await Meja.all();
        res.status(200).json({ success: true, data: meja });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.detail = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id } = req.params;
        const meja = await Meja.find(id);
        
        if (!meja) return res.status(404).json({ message: "Meja tidak ditemukan" });

        res.status(200).json({ success: true, data: meja });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Endpoint khusus untuk mengambil meja yg available (Dropdown Flutter)
exports.listAvailable = async (req, res) => {
    try {
        const meja = await Meja.getTersedia();
        res.status(200).json({ success: true, data: meja });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.store = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { no_meja, status, kapasitas } = req.body;

        // 1. Validasi Input
        if (!no_meja || !status || !kapasitas) {
            return res.status(400).json({ message: "Data tidak lengkap" });
        }

        // 2. Cek Duplikasi Nomor Meja
        const existing = await Meja.findByNoMeja(no_meja);
        if (existing) {
            return res.status(400).json({ message: `Nomor meja ${no_meja} sudah ada.` });
        }

        // 3. Simpan
        await Meja.create({ no_meja, status, kapasitas });
        const newId = await Meja.getLastId();

        res.status(201).json({ 
            success: true, 
            message: "Meja berhasil ditambahkan", 
            id: newId 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id } = req.params;
        const { no_meja, status, kapasitas } = req.body;

        const oldMeja = await Meja.find(id);
        if (!oldMeja) return res.status(404).json({ message: "Meja tidak ditemukan" });

        // 1. Cek Duplikasi (Jika nomor meja diubah)
        // Logika: Jika no_meja di input beda dengan no_meja lama, cek apakah no baru itu sudah dipake orang lain
        if (no_meja != oldMeja.no_meja) {
            const existing = await Meja.findByNoMeja(no_meja);
            if (existing) {
                return res.status(400).json({ message: `Nomor meja ${no_meja} sudah digunakan meja lain.` });
            }
        }

        // 2. Update
        await Meja.update(id, { no_meja, status, kapasitas });

        res.status(200).json({ success: true, message: "Meja berhasil diperbarui" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id } = req.params;

        // TODO: (Opsional) Cek apakah meja sedang ada di Pesanan aktif?
        // Jika ada logic itu, tambahkan di sini sebelum delete.

        const result = await Meja.delete(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Meja tidak ditemukan" });
        }

        res.status(200).json({ success: true, message: "Meja berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};