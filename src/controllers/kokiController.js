const DetailPesanan = require('../models/detailPesananModel');

// Helper Auth: Hanya Koki
const isAuthorized = (role) => {
    return role === 'koki';
};

// 1. Menampilkan daftar menu yang belum selesai dimasak
exports.index = async (req, res) => {
    try {
        // Cek Role
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak. Hanya koki." });
        }

        const menuBelumMasak = await DetailPesanan.getBelumMasak();
        
        res.status(200).json({ 
            success: true, 
            data: menuBelumMasak 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Update status masak per item (Satu baris detail)
exports.updateItemStatus = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id_detail } = req.params; // Ambil ID dari URL
        const { status } = req.body;      // Ambil status dari Body JSON

        // Validasi Input
        if (!id_detail || !status) {
            return res.status(400).json({ message: "Parameter tidak lengkap" });
        }

        // Validasi Status Enum
        const allowedStatuses = ['belum', 'sedang', 'selesai']; // Sesuai DB
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        await DetailPesanan.updateStatusMasak(id_detail, status);

        res.status(200).json({ 
            success: true, 
            message: "Status item berhasil diperbarui" 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Update status masak per Pesanan (Bulk Update satu pesanan sekaligus)
exports.updateOrderStatus = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id_pesanan } = req.params; // Ambil ID Pesanan dari URL
        const { status } = req.body;

        // Validasi Input
        if (!id_pesanan || !status) {
            return res.status(400).json({ message: "Parameter tidak lengkap" });
        }

        // Validasi Status Enum
        const allowedStatuses = ['belum', 'sedang', 'selesai'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Status tidak valid" });
        }

        await DetailPesanan.updateStatusByPesanan(id_pesanan, status);

        res.status(200).json({ 
            success: true, 
            message: "Status seluruh pesanan berhasil diperbarui" 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};