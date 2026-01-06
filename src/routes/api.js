const express = require('express');
const router = express.Router();

// Import Controllers
const authController = require('../controllers/authController');
const menuController = require('../controllers/menuController');
const stokController = require('../controllers/stokBahanController');
const mejaController = require('../controllers/mejaController');
const bahanMenuController = require('../controllers/bahanMenuController');
const pesananController = require('../controllers/pesananController');
const reservasiController = require('../controllers/reservasiController');
const transaksiController = require('../controllers/transaksiController');
const userController = require('../controllers/userController');
const kokiController = require('../controllers/kokiController');
const homeController = require('../controllers/homeController');
const laporanController = require('../controllers/laporanController');
const dashboardController = require('../controllers/dashboardController');

// Import Middleware (UPDATE: Import roleCheck juga)
const { verifyToken, roleCheck } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Middleware foto

// =========================================================================
// DEFINISI ROUTES
// =========================================================================

// --- AUTH (Public) ---
router.post('/login', authController.login);
router.post('/register', authController.register); // Biasanya register awal public, atau bisa diprotek admin only

// --- MENU ---
// Logic PHP: Hanya Admin & Koki yang bisa akses manajemen menu
const menuRoles = ['admin', 'koki']; 

// GET (Mungkin pelayan/kasir butuh lihat menu untuk input order? Jika ya, tambahkan ke array)
router.get('/menus', verifyToken, roleCheck(['admin', 'koki', 'pelayan', 'kasir']), menuController.index); 
router.get('/menus/:id', verifyToken, roleCheck(['admin', 'koki', 'pelayan', 'kasir']), menuController.detail);

// CRUD (Create, Update, Delete) - Strict Admin & Koki
router.post('/menus', verifyToken, roleCheck(menuRoles), upload.single('foto'), menuController.store);
router.put('/menus/:id', verifyToken, roleCheck(menuRoles), upload.single('foto'), menuController.update);
router.delete('/menus/:id', verifyToken, roleCheck(menuRoles), menuController.delete);


// --- STOK BAHAN ---
// Logic PHP: Hanya Admin & Koki
const stokRoles = ['admin', 'koki'];

router.get('/stok', verifyToken, roleCheck(stokRoles), stokController.index);
router.get('/stok/available', verifyToken, roleCheck(stokRoles), stokController.available);
router.get('/stok/low', verifyToken, roleCheck(stokRoles), stokController.lowStock);
router.get('/stok/:id', verifyToken, roleCheck(stokRoles), stokController.detail);
router.post('/stok', verifyToken, roleCheck(stokRoles), stokController.store);
router.put('/stok/:id', verifyToken, roleCheck(stokRoles), stokController.update);
router.delete('/stok/:id', verifyToken, roleCheck(stokRoles), stokController.delete);


// --- MEJA ---
// Logic PHP: Admin & Pelayan (Kasir mungkin butuh akses read untuk membebaskan meja via transaksi)
const mejaRoles = ['admin', 'pelayan'];
const mejaReadRoles = ['admin', 'pelayan', 'kasir']; 

router.get('/meja', verifyToken, roleCheck(mejaReadRoles), mejaController.index);
router.get('/meja/available', verifyToken, roleCheck(mejaReadRoles), mejaController.listAvailable);
router.get('/meja/:id', verifyToken, roleCheck(mejaReadRoles), mejaController.detail);

// CRUD Meja (Strict Admin & Pelayan)
router.post('/meja', verifyToken, roleCheck(mejaRoles), mejaController.store);
router.put('/meja/:id', verifyToken, roleCheck(mejaRoles), mejaController.update);
router.delete('/meja/:id', verifyToken, roleCheck(mejaRoles), mejaController.delete);


// --- BAHAN MENU (Resep) ---
// Logic PHP: Admin & Koki
const bahanRoles = ['admin', 'koki'];

router.get('/menus/:id_menu/bahan', verifyToken, roleCheck(bahanRoles), bahanMenuController.index);
router.post('/menus/:id_menu/bahan', verifyToken, roleCheck(bahanRoles), bahanMenuController.store);
router.delete('/menus/:id_menu/bahan/:id_stok', verifyToken, roleCheck(bahanRoles), bahanMenuController.delete);


// --- PESANAN UTAMA ---
// Create: Pelayan (biasanya), Admin, atau Kasir
router.post('/pesanan', verifyToken, roleCheck(['admin', 'pelayan', 'kasir']), pesananController.store);

// Read: Admin, Manajer, Kasir, Pelayan, Koki (semua butuh lihat data pesanan)
router.get('/pesanan', verifyToken, roleCheck(['admin', 'pelayan', 'kasir', 'koki']), pesananController.index);
router.get('/pesanan/:id', verifyToken, roleCheck(['admin', 'pelayan', 'kasir', 'koki']), pesananController.show);

// Update Status Global: Admin & Koki (untuk status masak)
router.put('/pesanan/:id/status', verifyToken, roleCheck(['admin', 'koki']), pesananController.updateStatus);


// --- DASHBOARD KHUSUS / OPERASIONAL ---

// KOKI: Khusus Koki (Melihat & Update Masakan)
router.get('/koki/orders', verifyToken, roleCheck(['koki']), pesananController.kokiList);
router.put('/koki/items/:id_detail', verifyToken, roleCheck(['koki']), pesananController.updateItemStatus);

// KOKI CONTROLLER (Alternate endpoints yang Anda buat)
router.get('/koki/tasks', verifyToken, roleCheck(['koki']), kokiController.index);
router.put('/koki/items/:id_detail', verifyToken, roleCheck(['koki']), kokiController.updateItemStatus);
router.put('/koki/orders/:id_pesanan', verifyToken, roleCheck(['koki']), kokiController.updateOrderStatus);

// KASIR: Khusus Kasir & Admin (Lihat antrian bayar)
router.get('/kasir/orders', verifyToken, roleCheck(['admin', 'kasir']), pesananController.kasirList);


// --- RESERVASI ---
// Logic PHP: Admin & Pelayan
const reservasiRoles = ['admin', 'pelayan'];

router.get('/reservasi', verifyToken, roleCheck(reservasiRoles), reservasiController.index);
router.get('/reservasi/:id', verifyToken, roleCheck(reservasiRoles), reservasiController.show);
router.get('/reservasi/upcoming/list', verifyToken, roleCheck(reservasiRoles), reservasiController.upcoming);
router.post('/reservasi', verifyToken, roleCheck(reservasiRoles), reservasiController.store);
router.put('/reservasi/:id', verifyToken, roleCheck(reservasiRoles), reservasiController.update);
router.delete('/reservasi/:id', verifyToken, roleCheck(reservasiRoles), reservasiController.delete);


// --- TRANSAKSI (PEMBAYARAN) ---
// Logic PHP: Admin & Kasir
const transaksiRoles = ['admin', 'kasir'];

router.get('/transaksi', verifyToken, roleCheck(transaksiRoles), transaksiController.index);
router.post('/transaksi', verifyToken, roleCheck(transaksiRoles), transaksiController.store);
router.get('/transaksi/:id/struk', verifyToken, roleCheck(transaksiRoles), transaksiController.showReceipt);


// --- LAPORAN ---
// Logic PHP: Admin & Kasir
router.get('/laporan', verifyToken, roleCheck(['admin', 'kasir']), laporanController.index);
router.get('/laporan/rekap', verifyToken, roleCheck(['admin']), transaksiController.rekap); // Biasanya rekap cuma admin
router.get('/laporan/export', verifyToken, roleCheck(['admin', 'kasir']), laporanController.exportExcel);


// --- MANAJEMEN USER ---
// STRICT: ADMIN ONLY
router.get('/users', verifyToken, roleCheck(['admin']), userController.index);
router.get('/users/:id', verifyToken, roleCheck(['admin']), userController.show);
router.post('/users', verifyToken, roleCheck(['admin']), userController.store);
router.put('/users/:id', verifyToken, roleCheck(['admin']), userController.update);
router.delete('/users/:id', verifyToken, roleCheck(['admin']), userController.delete);


// --- PUBLIC / HOME (CUSTOMER APP) ---
// Tidak perlu token (Public Access)
router.get('/home', homeController.index);
router.get('/home/menu', homeController.menu);


// --- DASHBOARD (GENERAL) ---
// Terbuka untuk semua user yang login, logic konten diatur di dalam controller
router.get('/dashboard', verifyToken, dashboardController.index);

module.exports = router;