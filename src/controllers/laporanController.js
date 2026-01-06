const Transaksi = require('../models/transaksiModel');
const { Parser } = require('json2csv'); // Library untuk konversi JSON ke CSV

// Helper Auth: Hanya Admin & Kasir
const isAuthorized = (role) => {
    return role === 'admin' || role === 'kasir';
};

// 1. Tampilkan Data Laporan (JSON)
exports.index = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        const { tanggal_awal, tanggal_akhir, id_user } = req.query;

        // Validasi Tanggal
        if (!tanggal_awal || !tanggal_akhir) {
            return res.status(400).json({ message: "Tanggal awal dan akhir wajib diisi" });
        }

        // Ambil Data
        const rekap = await Transaksi.getRekap(tanggal_awal, tanggal_akhir);
        const detail = await Transaksi.filterLaporan(tanggal_awal, tanggal_akhir, id_user);

        // Gabungkan response
        res.status(200).json({
            success: true,
            filter: { tanggal_awal, tanggal_akhir, id_user },
            summary: {
                jumlah_transaksi: rekap.jumlah_transaksi,
                total_pendapatan: rekap.total,
                total_diskon: rekap.diskon,
                total_kembalian: rekap.kembalian
            },
            data: detail
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Export Laporan ke CSV (Download File)
exports.exportExcel = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        const { tanggal_awal, tanggal_akhir, id_user } = req.query;

        if (!tanggal_awal || !tanggal_akhir) {
            return res.status(400).json({ message: "Tanggal awal dan akhir wajib diisi" });
        }

        // Ambil Data
        const detail = await Transaksi.filterLaporan(tanggal_awal, tanggal_akhir, id_user);

        if (detail.length === 0) {
            return res.status(404).json({ message: "Tidak ada data transaksi pada rentang tanggal ini" });
        }

        // Konfigurasi Field CSV
        const fields = [
            { label: 'ID Transaksi', value: 'id_transaksi' },
            { label: 'Kasir', value: 'nama_user' },
            { label: 'ID Pesanan', value: 'id_pesanan' },
            { label: 'Nama Pemesan', value: 'nama_pemesan' },
            { label: 'No Antrian', value: 'no_antrian' },
            { label: 'Tipe', value: 'tipe_pesanan' },
            { label: 'Total', value: 'total' },
            { label: 'Diskon', value: 'diskon' },
            { label: 'Kembalian', value: 'kembalian' },
            { label: 'Metode', value: 'metode_pembayaran' },
            { label: 'Tanggal', value: 'created_at' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(detail);

        // Set Header agar browser mendownload file
        const filename = `laporan_transaksi_${tanggal_awal}_to_${tanggal_akhir}.csv`;
        
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename="${filename}"`);
        
        return res.send(csv);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};