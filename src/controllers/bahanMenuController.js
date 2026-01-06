const BahanMenu = require('../models/bahanMenuModel');
const Menu = require('../models/menuModel');
const StokBahan = require('../models/stokBahanModel');

// Helper: Cek Role
const isAuthorized = (role) => {
    return role === 'admin' || role === 'koki';
};

exports.index = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak. Hanya admin & koki." });
        }

        const { id_menu } = req.params; // Kita ambil dari URL parameter

        // 1. Cek Menu Exist
        const menu = await Menu.find(id_menu);
        if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        // 2. Ambil Bahan
        const bahan = await BahanMenu.getByMenu(id_menu);
        
        res.status(200).json({ 
            success: true, 
            menu_name: menu.nama_menu,
            data: bahan 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.store = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id_menu } = req.params; // ID Menu dari URL
        const { id_stok, jumlah } = req.body; // Data bahan dari Body JSON

        // 1. Validasi Input Dasar
        if (!id_menu || !id_stok || !jumlah || jumlah <= 0) {
            return res.status(400).json({ message: "Data tidak valid" });
        }

        // 2. Cek Menu Exist
        const menu = await Menu.find(id_menu);
        if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        // 3. Ambil Data Stok (Penting: Logic PHP baris 119 - ambil satuan dari stok master)
        const stokItem = await StokBahan.find(id_stok);
        if (!stokItem) {
            return res.status(404).json({ message: "Stok bahan tidak ditemukan" });
        }
        
        const satuan = stokItem.satuan; // Ambil satuan otomatis dari master stok

        // 4. Simpan ke BahanMenu
        await BahanMenu.create({
            id_menu,
            id_stok,
            jumlah,
            satuan
        });

        res.status(201).json({ 
            success: true, 
            message: "Bahan berhasil ditambahkan ke menu",
            detail: {
                bahan: stokItem.nama_bahan,
                jumlah: jumlah,
                satuan: satuan
            }
        });

    } catch (error) {
        // Handle jika duplicate entry (bahan sudah ada di menu)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Bahan ini sudah ada di menu tersebut." });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) {
            return res.status(403).json({ message: "Akses ditolak." });
        }

        const { id_menu, id_stok } = req.params; // Ambil kedua ID dari URL

        if (!id_menu || !id_stok) {
            return res.status(400).json({ message: "Parameter tidak lengkap" });
        }

        const result = await BahanMenu.deleteByMenuAndStok(id_menu, id_stok);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bahan tidak ditemukan di menu ini" });
        }

        res.status(200).json({ success: true, message: "Bahan berhasil dihapus dari menu" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};