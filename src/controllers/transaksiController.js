const Transaksi = require('../models/transaksiModel');
const Pesanan = require('../models/pesananModel');
const DetailPesanan = require('../models/detailPesananModel');
const Meja = require('../models/mejaModel');
const User = require('../models/userModel'); // Untuk nama kasir di struk
const db = require('../config/database');

// Helper Auth: Hanya Admin & Kasir
const isAuthorized = (role) => {
    return role === 'admin' || role === 'kasir';
};

exports.index = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        const data = await Transaksi.all();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- LOGIKA UTAMA: PEMBAYARAN ---
exports.store = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        await connection.beginTransaction();

        const { id_pesanan, diskon, bayar, metode_pembayaran } = req.body;
        const id_user_kasir = req.user.id; // Dari Token JWT

        // 1. Validasi Input Dasar
        if (!id_pesanan || bayar === undefined || !metode_pembayaran) {
            throw new Error("Data pembayaran tidak lengkap");
        }

        // 2. Cek Validitas Pesanan
        const [rowsPesanan] = await connection.query("SELECT * FROM pesanan WHERE id_pesanan = ?", [id_pesanan]);
        const pesananData = rowsPesanan[0];

        if (!pesananData) throw new Error("Pesanan tidak ditemukan");
        if (pesananData.status_pembayaran === 'dibayar') throw new Error("Pesanan sudah dibayar sebelumnya");
        if (pesananData.status !== 'selesai') throw new Error("Pesanan belum selesai dimasak");

        // 3. Hitung Total Tagihan (Server Side Calculation agar aman)
        // Kita hitung ulang total dari detail pesanan (jumlah * harga menu)
        const sqlHitung = `
            SELECT SUM(dp.jumlah * m.harga) as grand_total 
            FROM detail_pesanan dp 
            JOIN menu m ON dp.id_menu = m.id_menu 
            WHERE dp.id_pesanan = ?
        `;
        const [rowsHitung] = await connection.query(sqlHitung, [id_pesanan]);
        const actualTotal = parseFloat(rowsHitung[0].grand_total || 0);

        // 4. Hitung Diskon & Kembalian
        const diskonFloat = parseFloat(diskon || 0);
        let totalSetelahDiskon = actualTotal - diskonFloat;
        if (totalSetelahDiskon < 0) totalSetelahDiskon = 0;

        const bayarFloat = parseFloat(bayar);
        if (bayarFloat < totalSetelahDiskon) {
            throw new Error(`Pembayaran kurang! (Total: ${totalSetelahDiskon}, Bayar: ${bayarFloat})`);
        }
        
        const kembalian = bayarFloat - totalSetelahDiskon;

        // 5. Simpan Transaksi
        await Transaksi.create({
            id_user: id_user_kasir,
            id_pesanan: id_pesanan,
            metode_pembayaran,
            total: totalSetelahDiskon,
            diskon: diskonFloat,
            kembalian: kembalian
        }, connection);

        const newIdTransaksi = await Transaksi.getLastId(connection);

        // 6. Update Status Pesanan -> 'dibayar'
        await connection.query("UPDATE pesanan SET status_pembayaran = 'dibayar' WHERE id_pesanan = ?", [id_pesanan]);

        // 7. BEBASKAN MEJA (Jika Dine In / Reservasi)
        if (['dine_in', 'reservasi'].includes(pesananData.tipe_pesanan) && pesananData.id_meja) {
            // Cek apakah meja masih ada
            const [rowsMeja] = await connection.query("SELECT * FROM meja WHERE id_meja = ?", [pesananData.id_meja]);
            if (rowsMeja.length > 0) {
                // Set status meja jadi 'tersedia'
                await connection.query("UPDATE meja SET status = 'tersedia' WHERE id_meja = ?", [pesananData.id_meja]);
            }
        }

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            message: "Pembayaran berhasil", 
            id_transaksi: newIdTransaksi,
            kembalian: kembalian
        });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// --- DATA UNTUK CETAK STRUK ---
exports.showReceipt = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        const { id } = req.params;
        const transaksi = await Transaksi.find(id);
        if (!transaksi) return res.status(404).json({ message: "Transaksi tidak ditemukan" });

        // Ambil detail pesanan (menu yg dibeli)
        const items = await DetailPesanan.getByPesanan(transaksi.id_pesanan);
        
        // Ambil info kasir
        const kasir = await User.find(transaksi.id_user);

        // Ambil info pesanan (utk nama pemesan & no meja)
        const pesanan = await Pesanan.find(transaksi.id_pesanan);

        const strukData = {
            info_transaksi: transaksi,
            kasir_nama: kasir ? kasir.nama : 'Unknown',
            pelanggan: pesanan ? pesanan.nama_pemesan : 'Unknown',
            no_meja: pesanan ? pesanan.no_meja : '-',
            items: items
        };

        res.status(200).json({ success: true, data: strukData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- LAPORAN REKAP ---
exports.rekap = async (req, res) => {
    try {
        // Biasanya hanya admin/owner yang boleh lihat laporan
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Hanya admin" });

        const { awal, akhir } = req.query; // format YYYY-MM-DD
        const data = await Transaksi.getRekap(awal, akhir);
        
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};