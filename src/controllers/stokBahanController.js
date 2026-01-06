const StokBahan = require('../models/stokBahanModel');

// Helper Function: Cek Role (Logic PHP: !Auth::role('admin') && !Auth::role('koki'))
const isAuthorized = (role) => {
    return role === 'admin' || role === 'koki';
};

// Helper Function: Hitung Status Otomatis (Logic PHP: getStatusOtomatis)
const getStatusOtomatis = (jumlah) => {
    const qty = parseInt(jumlah);
    if (qty <= 0) return 'habis';
    if (qty <= 5) return 'hampir habis';
    return 'tersedia';
};

exports.index = async (req, res) => {
    try {
        // Cek Role (Dari Token yang didapat di middleware auth)
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak. Hanya admin & koki." });
        }

        const stok = await StokBahan.all();
        res.status(200).json({ success: true, data: stok });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.available = async (req, res) => {
    try {
        const stok = await StokBahan.allAvailable();
        res.status(200).json({ success: true, data: stok });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.detail = async (req, res) => {
    try {
        const { id } = req.params;
        const stok = await StokBahan.find(id);
        
        if (!stok) return res.status(404).json({ message: "Data stok tidak ditemukan" });

        res.status(200).json({ success: true, data: stok });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.store = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { nama_bahan, jumlah_stok, satuan, jenis } = req.body;

        // Validasi input sederhana
        if (!nama_bahan || jumlah_stok === undefined || !satuan || !jenis) {
            return res.status(400).json({ message: "Data tidak lengkap" });
        }

        // Logic Status Otomatis
        const status = getStatusOtomatis(jumlah_stok);

        await StokBahan.create({
            nama_bahan, jumlah_stok, satuan, jenis, status
        });

        const newId = await StokBahan.getLastId();

        res.status(201).json({ 
            success: true, 
            message: "Stok berhasil ditambahkan", 
            id: newId,
            status_set: status
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
        const { nama_bahan, jumlah_stok, satuan, jenis } = req.body;

        const oldStok = await StokBahan.find(id);
        if (!oldStok) return res.status(404).json({ message: "Data stok tidak ditemukan" });

        // Logic Status Otomatis
        const status = getStatusOtomatis(jumlah_stok);

        await StokBahan.update(id, {
            nama_bahan, jumlah_stok, satuan, jenis, status
        });

        res.status(200).json({ 
            success: true, 
            message: "Stok berhasil diperbarui",
            status_new: status
        });

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
        const result = await StokBahan.delete(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Data tidak ditemukan atau sudah dihapus" });
        }

        res.status(200).json({ success: true, message: "Data stok berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.lowStock = async (req, res) => {
    try {
        const stok = await StokBahan.getLowStock();
        res.status(200).json({ success: true, data: stok });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};