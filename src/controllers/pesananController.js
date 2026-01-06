const Pesanan = require('../models/pesananModel');
const DetailPesanan = require('../models/detailPesananModel');
const Meja = require('../models/mejaModel');
const Menu = require('../models/menuModel');
const BahanMenu = require('../models/bahanMenuModel');
const StokBahan = require('../models/stokBahanModel');
const db = require('../config/database'); // Perlu ini untuk handle transaction

// Helper Auth
const isAuthorized = (role, allowedRoles) => allowedRoles.includes(role);

exports.index = async (req, res) => {
    try {
        const pesanan = await Pesanan.all();
        res.status(200).json({ success: true, data: pesanan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const pesanan = await Pesanan.find(id);
        if (!pesanan) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

        const detail = await DetailPesanan.getByPesanan(id);
        
        // Gabungkan data header dan detail
        const responseData = {
            ...pesanan,
            items: detail
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- LOGIKA UTAMA: CREATE PESANAN ---
exports.store = async (req, res) => {
    // Kita butuh koneksi spesifik untuk transaksi, bukan pool biasa
    const connection = await db.getConnection(); 
    
    try {
        await connection.beginTransaction(); // MULAI TRANSAKSI

        const { nama_pemesan, tipe_pesanan, no_meja, items } = req.body;
        // items format: [{id_menu: 'MN001', jumlah: 2, catatan: 'pedas'}, ...]

        // 1. Validasi Input
        if (!nama_pemesan || !tipe_pesanan || !items || items.length === 0) {
            throw new Error("Data pesanan tidak lengkap");
        }

        // 2. Logic Meja (Jika Dine In / Reservasi)
        let id_meja_final = null;
        if (tipe_pesanan === 'dine_in' || tipe_pesanan === 'reservasi') {
            if (!no_meja) throw new Error(`Nomor meja wajib untuk ${tipe_pesanan}`);
            
            // Cek ketersediaan meja (Penting! Query pakai connection transaksi agar terkunci jika perlu)
            const [mejaRows] = await connection.query("SELECT * FROM meja WHERE id_meja = ?", [no_meja]);
            const mejaData = mejaRows[0];

            if (!mejaData) throw new Error("Meja tidak ditemukan");
            if (mejaData.status !== 'tersedia') throw new Error(`Meja ${mejaData.no_meja} sedang tidak tersedia`);

            // Update status meja
            const statusMeja = (tipe_pesanan === 'dine_in') ? 'digunakan' : 'digunakan'; // logic PHP anda: dine_in -> digunakan
            await connection.query("UPDATE meja SET status = ? WHERE id_meja = ?", [statusMeja, no_meja]);
            
            id_meja_final = no_meja;
        }

        // 3. Logic Cek Stok & Persiapan Insert
        // Kita harus loop semua item DULU sebelum insert apapun untuk memastikan stok cukup
        for (const item of items) {
            const bahanDibutuhkan = await BahanMenu.getByMenu(item.id_menu);
            
            for (const bahan of bahanDibutuhkan) {
                // Cek stok terkini
                const [stokRows] = await connection.query("SELECT * FROM stok_bahan WHERE id_stok = ?", [bahan.id_stok]);
                const stokSaatIni = stokRows[0];
                
                const totalDikurang = bahan.jumlah * item.jumlah;

                if (stokSaatIni.jumlah_stok < totalDikurang) {
                    throw new Error(`Stok ${stokSaatIni.nama_bahan} tidak cukup! (Sisa: ${stokSaatIni.jumlah_stok}, Butuh: ${totalDikurang})`);
                }
            }
        }

        // 4. Create Header Pesanan
        const no_antrian = await Pesanan.getNextAntrian();
        
        await Pesanan.create({
            nama_pemesan,
            no_antrian,
            id_meja: id_meja_final,
            tipe_pesanan
        }, connection);

        // Ambil ID yang baru saja dibuat (Workaround Trigger)
        // Kita gunakan connection yg sama agar konsisten
        const newIdPesanan = await Pesanan.getLastId(connection);

        // 5. Insert Detail & Kurangi Stok (Sekarang aman karena sudah divalidasi di step 3)
        for (const item of items) {
            // Insert ke tabel detail_pesanan
            await DetailPesanan.create({
                id_pesanan: newIdPesanan,
                id_menu: item.id_menu,
                jumlah: item.jumlah,
                catatan: item.catatan
            }, connection);

            // Kurangi Stok Bahan
            const bahanDibutuhkan = await BahanMenu.getByMenu(item.id_menu);
            for (const bahan of bahanDibutuhkan) {
                const totalDikurang = bahan.jumlah * item.jumlah;
                
                // Update stok (Query langsung decrement agar atomic)
                await connection.query(`
                    UPDATE stok_bahan 
                    SET jumlah_stok = jumlah_stok - ?, 
                        status = CASE WHEN (jumlah_stok - ?) <= 0 THEN 'habis' 
                                      WHEN (jumlah_stok - ?) <= 5 THEN 'hampir habis' 
                                      ELSE 'tersedia' END
                    WHERE id_stok = ?
                `, [totalDikurang, totalDikurang, totalDikurang, bahan.id_stok]);
            }
        }

        await connection.commit(); // SIMPAN PERMANEN
        
        res.status(201).json({ 
            success: true, 
            message: "Pesanan berhasil dibuat", 
            id_pesanan: newIdPesanan,
            no_antrian: no_antrian
        });

    } catch (error) {
        await connection.rollback(); // BATALKAN SEMUA JIKA ERROR
        res.status(400).json({ 
            success: false, 
            message: "Pesanan gagal: " + error.message 
        });
    } finally {
        connection.release(); // Kembalikan koneksi ke pool
    }
};

// Update Status Pesanan (Admin/Koki)
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // status: 'sedang dimasak', 'selesai', 'dibatalkan'
        const userRole = req.user.role;

        // Logic Otorisasi PHP
        let authorized = false;
        if (userRole === 'admin') authorized = true;
        if (userRole === 'koki' && ['sedang dimasak', 'selesai'].includes(status)) authorized = true;

        if (!authorized) return res.status(403).json({ message: "Role tidak diizinkan" });

        await Pesanan.updateStatus(id, status);
        res.status(200).json({ success: true, message: "Status pesanan diperbarui" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// List untuk Dapur (Koki)
exports.kokiList = async (req, res) => {
    try {
        const list = await DetailPesanan.getBelumMasak();
        res.status(200).json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Status per Item (Koki)
exports.updateItemStatus = async (req, res) => {
    try {
        const { id_detail } = req.params;
        const { status } = req.body; // 'sedang', 'selesai'
        
        await DetailPesanan.updateStatusMasak(id_detail, status);
        res.status(200).json({ success: true, message: "Status item diperbarui" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// List untuk Kasir (Siap Bayar)
exports.kasirList = async (req, res) => {
    try {
        // Logic getOrdersForTransaction PHP
        const list = await Pesanan.getOrdersForTransaction();
        res.status(200).json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};