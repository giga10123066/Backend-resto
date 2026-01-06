const Reservasi = require('../models/reservasiModel');
const Meja = require('../models/mejaModel');
const db = require('../config/database');

// Helper Auth: Hanya Admin & Pelayan
const isAuthorized = (role) => {
    return role === 'admin' || role === 'pelayan';
};

exports.index = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });
        
        const data = await Reservasi.all();
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.show = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });
        
        const { id } = req.params;
        const data = await Reservasi.find(id);
        if (!data) return res.status(404).json({ message: "Reservasi tidak ditemukan" });

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.upcoming = async (req, res) => {
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });
        
        const limit = req.query.limit || 5;
        const data = await Reservasi.getUpcoming(limit);
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- CREATE RESERVASI ---
exports.store = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        await connection.beginTransaction();

        const { nama_pemesan, id_meja, jml_orang, no_telp, tanggal, waktu, status, catatan } = req.body;

        // 1. Validasi Input
        if (!nama_pemesan || !id_meja || !jml_orang || !no_telp || !tanggal || !waktu) {
            throw new Error("Data reservasi tidak lengkap");
        }

        // 2. Cek Meja (Apakah meja valid & tersedia)
        // Kita gunakan query manual via connection agar konsisten jika ada lock, tapi select biasa juga oke
        const [rowsMeja] = await connection.query("SELECT * FROM meja WHERE id_meja = ?", [id_meja]);
        const mejaInfo = rowsMeja[0];

        if (!mejaInfo) throw new Error("Meja tidak valid");

        // Logic PHP: Cek status meja jika reservasi aktif
        const statusAktif = ['pending', 'disetujui', 'dikonfirmasi']; // Sesuaikan dengan ENUM DB Anda
        if (statusAktif.includes(status || 'pending')) {
            if (mejaInfo.status !== 'tersedia') {
                throw new Error("Meja yang dipilih sedang tidak tersedia");
            }
            if (parseInt(jml_orang) > mejaInfo.kapasitas) {
                throw new Error("Jumlah orang melebihi kapasitas meja");
            }
        }

        // 3. Insert Reservasi
        await Reservasi.create({
            nama_pemesan, id_meja, jml_orang, no_telp, tanggal, waktu, status, catatan
        }, connection);

        const newId = await Reservasi.getLastId(connection);

        // 4. Update Status Meja -> 'terreservasi'
        if (statusAktif.includes(status || 'pending')) {
            await connection.query("UPDATE meja SET status = 'terreservasi' WHERE id_meja = ?", [id_meja]);
        }

        await connection.commit();
        res.status(201).json({ success: true, message: "Reservasi berhasil dibuat", id: newId });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// --- UPDATE RESERVASI ---
exports.update = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        await connection.beginTransaction();

        const { id } = req.params;
        const { nama_pemesan, id_meja, jml_orang, no_telp, tanggal, waktu, status, catatan } = req.body;

        // 1. Ambil Data Lama
        const [oldRows] = await connection.query("SELECT * FROM reservasi WHERE id_reservasi = ?", [id]);
        const oldData = oldRows[0];
        if (!oldData) throw new Error("Reservasi tidak ditemukan");

        // 2. Logic Perubahan Meja
        // Jika ID Meja berubah, meja lama harus dibebaskan (jika status lama aktif)
        // Meja baru harus dicek ketersediaannya
        if (id_meja !== oldData.id_meja) {
            // Bebaskan Meja Lama
            // Cek apakah meja lama statusnya 'terreservasi', jika ya ubah jadi 'tersedia'
            const [oldMejaCheck] = await connection.query("SELECT status FROM meja WHERE id_meja = ?", [oldData.id_meja]);
            if (oldMejaCheck[0] && oldMejaCheck[0].status === 'terreservasi') {
                await connection.query("UPDATE meja SET status = 'tersedia' WHERE id_meja = ?", [oldData.id_meja]);
            }
            
            // Cek Meja Baru
            const [newMejaCheck] = await connection.query("SELECT status, kapasitas FROM meja WHERE id_meja = ?", [id_meja]);
            const newMeja = newMejaCheck[0];
            
            // Validasi Meja Baru (hanya jika reservasi ini aktif)
            const statusAktif = ['pending', 'disetujui', 'dikonfirmasi'];
            if (statusAktif.includes(status)) {
                if (!newMeja || newMeja.status !== 'tersedia') {
                    throw new Error("Meja baru tidak tersedia");
                }
                if (parseInt(jml_orang) > newMeja.kapasitas) {
                    throw new Error("Kapasitas meja baru tidak cukup");
                }
            }
        }

        // 3. Update Reservasi
        await Reservasi.update(id, {
            nama_pemesan, id_meja, jml_orang, no_telp, tanggal, waktu, status, catatan, id_pesanan: oldData.id_pesanan
        }, connection);

        // 4. Update Status Meja Baru (Sinkronisasi Akhir)
        // Jika status reservasi aktif -> Meja jadi 'terreservasi'
        // Jika status reservasi batal/selesai -> Meja jadi 'tersedia'
        const statusAktif = ['pending', 'disetujui', 'dikonfirmasi'];
        const newStatusMeja = statusAktif.includes(status) ? 'terreservasi' : 'tersedia';

        await connection.query("UPDATE meja SET status = ? WHERE id_meja = ?", [newStatusMeja, id_meja]);

        await connection.commit();
        res.status(200).json({ success: true, message: "Reservasi berhasil diperbarui" });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// --- DELETE RESERVASI ---
exports.delete = async (req, res) => {
    const connection = await db.getConnection();
    try {
        if (!isAuthorized(req.user.role)) return res.status(403).json({ message: "Akses ditolak" });

        await connection.beginTransaction();
        const { id } = req.params;

        const [rows] = await connection.query("SELECT * FROM reservasi WHERE id_reservasi = ?", [id]);
        const reservasi = rows[0];
        if (!reservasi) throw new Error("Reservasi tidak ditemukan");

        // 1. Bebaskan Meja jika reservasi masih aktif
        const statusAktif = ['pending', 'disetujui', 'dikonfirmasi'];
        if (reservasi.id_meja && statusAktif.includes(reservasi.status)) {
            await connection.query("UPDATE meja SET status = 'tersedia' WHERE id_meja = ?", [reservasi.id_meja]);
        }

        // 2. Hapus Reservasi
        await Reservasi.delete(id, connection);

        await connection.commit();
        res.status(200).json({ success: true, message: "Reservasi berhasil dihapus" });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};