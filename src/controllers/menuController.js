const Menu = require('../models/menuModel');
const StokBahan = require('../models/stokBahanModel'); // (Asumsi kita akan buat ini nanti)
const fs = require('fs');
const path = require('path');

// Helper untuk hapus file fisik
const deleteFile = (filename) => {
    if (!filename) return;
    const filepath = path.join(__dirname, '../../public/uploads/', filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
};

exports.index = async (req, res) => {
    try {
        const menus = await Menu.all();

        // Logic Grouping Kategori (Mirip PHP line 215)
        const menuGrouped = menus.reduce((groups, item) => {
            const category = item.kategori || 'Lainnya';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});

        res.status(200).json({
            success: true,
            data: menuGrouped,
            raw: menus // Opsional: kirim juga data mentah jika Flutter butuh list flat
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.detail = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await Menu.find(id);
        
        if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        const bahan = await Menu.getBahanByMenu(id);

        res.status(200).json({
            success: true,
            data: menu,
            bahan: bahan
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.store = async (req, res) => {
    try {
        // Ambil data dari Body (form-data)
        const { nama_menu, harga, deskripsi, status, kategori, bahan } = req.body;
        const foto = req.file ? req.file.filename : null;

        // 1. Simpan Menu
        await Menu.create({
            nama_menu, harga, deskripsi, foto, status, kategori
        });

        // 2. Ambil ID menu yang baru dibuat (Logic workaround Trigger)
        const newId = await Menu.getLastId();

        // 3. Simpan Bahan (Jika ada)
        // Format input bahan dari Flutter harus JSON String jika dikirim lewat Form-Data
        // Contoh: bahan = '[{"id_stok": "ST001", "jumlah": 10}]'
        if (bahan) {
            let bahanArray = [];
            try {
                bahanArray = typeof bahan === 'string' ? JSON.parse(bahan) : bahan;
            } catch (e) {
                console.log("Parsing bahan error", e);
            }

            for (const item of bahanArray) {
                // Logic cek stok (bisa ditambahkan validasi stok tersedia disini)
                await Menu.addBahan(newId, item.id_stok, item.jumlah, item.satuan || null);
            }
        }

        res.status(201).json({ success: true, message: "Menu berhasil dibuat", id: newId });

    } catch (error) {
        // Hapus foto jika database gagal insert
        if (req.file) deleteFile(req.file.filename);
        res.status(500).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_menu, harga, deskripsi, status, kategori, bahan, remove_foto } = req.body;
        
        // Cek Menu Lama
        const oldMenu = await Menu.find(id);
        if (!oldMenu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        let fotoName = undefined; // Undefined artinya tidak diupdate sqlnya

        // Logic Ganti Foto
        if (req.file) {
            deleteFile(oldMenu.foto); // Hapus foto lama
            fotoName = req.file.filename;
        } else if (remove_foto == '1') {
            deleteFile(oldMenu.foto);
            fotoName = null;
        }

        // 1. Update Tabel Menu
        await Menu.update(id, {
            nama_menu, harga, deskripsi, status, kategori,
            foto: fotoName
        });

        // 2. Update Bahan (Hapus semua, insert baru - Logic PHP line 326)
        if (bahan) {
            await Menu.deleteBahanByMenu(id);
            
            let bahanArray = [];
            try {
                bahanArray = typeof bahan === 'string' ? JSON.parse(bahan) : bahan;
            } catch (e) {}

            for (const item of bahanArray) {
                await Menu.addBahan(id, item.id_stok, item.jumlah, item.satuan || null);
            }
        }

        res.status(200).json({ success: true, message: "Menu berhasil diupdate" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const menu = await Menu.find(id);

        if (!menu) return res.status(404).json({ message: "Menu tidak ditemukan" });

        // Hapus file fisik
        deleteFile(menu.foto);

        // Hapus data (bahan menu otomatis terhapus jika di DB ada ON DELETE CASCADE, tapi di controller PHP Anda dihapus manual)
        await Menu.deleteBahanByMenu(id);
        await Menu.delete(id);

        res.status(200).json({ success: true, message: "Menu berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};