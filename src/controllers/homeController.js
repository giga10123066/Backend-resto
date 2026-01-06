const Menu = require('../models/menuModel');

// 1. Landing Page / Home Screen (Index)
// Logika: Menampilkan hanya menu yang "Tersedia"
exports.index = async (req, res) => {
    try {
        // Mengambil data menu yang statusnya 'tersedia'
        const menus = await Menu.getAvailable();

        // (Opsional) Grouping by Kategori agar enak ditampilkan di Flutter
        // Jika Flutter butuh list flat, bagian ini bisa dihapus
        const groupedMenus = menus.reduce((groups, item) => {
            const category = item.kategori || 'Lainnya';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});

        res.status(200).json({
            success: true,
            message: "Data Home berhasil diambil",
            data: groupedMenus, // Data terkelompok
            raw: menus          // Data mentah (list panjang)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Halaman Semua Menu
// Logika: Menampilkan SEMUA menu (termasuk yang habis, mungkin untuk info katalog)
exports.menu = async (req, res) => {
    try {
        const menus = await Menu.all();
        
        res.status(200).json({
            success: true,
            message: "Semua menu berhasil diambil",
            data: menus
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};