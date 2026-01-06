// src/database/seeds/01_import_sql_data.js

exports.seed = async function(knex) {
  // 1. Bersihkan tabel (Urutan reverse foreign key)
  await knex('detail_transaksi').del();
  await knex('reservasi').del();
  await knex('detail_pesanan').del();
  await knex('bahan_menu').del();
  await knex('pesanan').del();
  await knex('meja').del();
  await knex('stok_bahan').del();
  await knex('menu').del();
  await knex('users').del();

  // 2. Insert Data
  
  // Users (Pakai ID eksplisit karena auto-increment melompat)
  await knex('users').insert([
    { id_user: 12, nama: 'Admin Utama', gender: 'laki-laki', email: 'admin@gmail.com', password: '$2y$12$bTNUz.PNvj4CEZeMhehJye0vrE542V8bCLsqcQS7zYlKOPn5YV/Na', no_telp: '081234567890', role: 'admin', created_at: '2025-06-24 08:15:59' },
    { id_user: 13, nama: 'Kasir Satu', gender: 'laki-laki', email: 'kasir@gmail.com', password: '$2y$12$Vlp.0Bx10Skqvkc1iHQngu1NQ3Dg9czrw/guV5zMXIbWpEPpQKNZC', no_telp: '081234567891', role: 'kasir', created_at: '2025-06-24 08:16:00' },
    { id_user: 14, nama: 'Koki Hebat', gender: 'laki-laki', email: 'koki@gmail.com', password: '$2y$12$9JTgx.JILb6FipobteXVkOEzxsPWUB0H4P8O0PzRi/tmWUN5tstiG', no_telp: '081234567892', role: 'koki', created_at: '2025-06-24 08:16:00' },
    { id_user: 15, nama: 'Pelayan Ramah', gender: 'laki-laki', email: 'pelayan@gmail.com', password: '$2y$12$sMQJ4s5QnVZufb3O2eTUdOrtO1AzYtwTRZVJJ0IhyO/jeUrxLkw0u', no_telp: '081234567893', role: 'pelayan', created_at: '2025-06-24 08:16:00' },
    { id_user: 26, nama: 'Perempuan 1 DI kasir', gender: 'perempuan', email: 'perempuan@gmail.com', password: '$2y$12$8P6KHDEpWS6DsBQubrpQ9.nCl9BHh.5JnhijVkwniz7J7LTiqiUcK', no_telp: '8098876455456743', role: 'kasir', created_at: '2025-07-22 16:21:23' },
    { id_user: 27, nama: 'maman ', gender: 'laki-laki', email: 'maman@gmain.com', password: '$2y$12$mtfO/h1DB9AG8fBkzCtt0OLdtKJtaoBbW7G1/CotqScAscKtPRRYW', no_telp: '09876453112233456790', role: 'pelayan', created_at: '2025-07-31 13:29:03' }
  ]);

  // Menu (Tanpa ID, Trigger akan generate MN001 dst secara berurutan)
  // Pastikan urutan insert sesuai agar ID MNxxx match dengan data di bahan_menu
  await knex('menu').insert([
    { nama_menu: 'Nasi Goreng Spesial', harga: 18000, deskripsi: 'Nasi goreng dengan ayam dan telur', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Mie Goreng Jawa', harga: 17000, deskripsi: 'Mie goreng dengan sayur dan ayam', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Ayam Bakar Madu', harga: 25000, deskripsi: 'Ayam bakar dengan bumbu madu', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Sate Ayam', harga: 22000, deskripsi: '10 tusuk sate ayam bumbu kacang', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Nasi Uduk', harga: 15000, deskripsi: 'Nasi uduk dengan telur dan sambal', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Lontong Sayur', harga: 14000, deskripsi: 'Lontong dengan kuah santan dan sayur labu', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Bakso Kuah', harga: 16000, deskripsi: 'Bakso sapi dengan mie dan kuah segar', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Soto Ayam', harga: 18000, deskripsi: 'Soto ayam dengan nasi dan sambal', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Soto Betawi', harga: 25000, deskripsi: 'Soto betawi daging sapi dan santan', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Nasi Campur', harga: 20000, deskripsi: 'Nasi dengan aneka lauk', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Es Teh Manis', harga: 5000, deskripsi: 'Minuman teh manis dingin', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Kopi Hitam', harga: 7000, deskripsi: 'Kopi hitam panas', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Kopi Susu', harga: 9000, deskripsi: 'Kopi dengan susu kental manis', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Jus Jeruk', harga: 8000, deskripsi: 'Jus jeruk segar', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Jus Alpukat', harga: 10000, deskripsi: 'Jus alpukat manis', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Es Coklat', harga: 9000, deskripsi: 'Coklat dingin manis', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Lemon Tea', harga: 8500, deskripsi: 'Teh manis dengan lemon segar', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Soda Gembira', harga: 9500, deskripsi: 'Soda susu sirup merah', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Air Mineral', harga: 4000, deskripsi: 'Air mineral botol', foto: '68936cfaa0378_bff94ffc-2d9e-4805-ba7e-c19992006d06_43.jpeg', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Wedang Jahe', harga: 7500, deskripsi: 'Minuman jahe hangat', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Nasi Kuning', harga: 15000, deskripsi: 'Nasi kuning dengan telur dan tempe', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Ayam Geprek', harga: 19000, deskripsi: 'Ayam crispy dengan sambal geprek', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Tempe Mendoan', harga: 9000, deskripsi: 'Tempe goreng tipis khas Banyumas', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Ikan Bakar', harga: 27000, deskripsi: 'Ikan bakar bumbu kecap', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Sayur Asem', harga: 10000, deskripsi: 'Sayuran segar dengan kuah asam', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Capcay Goreng', harga: 16000, deskripsi: 'Sayur tumis ala chinese food', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Tahu Gejrot', harga: 8000, deskripsi: 'Tahu dengan kuah pedas manis', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Mie Rebus', harga: 14000, deskripsi: 'Mie instan rebus dengan topping', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Roti Bakar Coklat', harga: 10000, deskripsi: 'Roti bakar isi coklat', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Pisang Goreng', harga: 9000, deskripsi: 'Pisang goreng krispi', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Teh Tarik', harga: 8000, deskripsi: 'Teh susu khas Malaysia', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Jus Mangga', harga: 9000, deskripsi: 'Jus mangga segar', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Milkshake Vanilla', harga: 10000, deskripsi: 'Minuman susu rasa vanila', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Milkshake Coklat', harga: 10000, deskripsi: 'Minuman susu rasa coklat', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Es Teler', harga: 12000, deskripsi: 'Campuran alpukat, kelapa dan susu', status: 'tersedia', kategori: 'minuman' },
    { nama_menu: 'Bubur Ayam', harga: 14000, deskripsi: 'Bubur ayam lengkap dengan kerupuk', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Bakmi Ayam', harga: 16000, deskripsi: 'Mie dengan topping ayam cincang', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Martabak Telur', harga: 23000, deskripsi: 'Martabak isi daging dan telur', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Seblak Ceker', harga: 15000, deskripsi: 'Seblak pedas dengan ceker', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Cilok Bumbu Kacang', harga: 8000, deskripsi: 'Cilok isi daging dengan sambal kacang', status: 'tersedia', kategori: 'makanan' },
    { nama_menu: 'Kue Cubit', harga: 9000, deskripsi: 'Kue cubit manis dengan topping', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Dadar Gulung', harga: 7000, deskripsi: 'Kue isi kelapa dan gula merah', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Klepon', harga: 7000, deskripsi: 'Kue bola isi gula merah', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Puding Coklat', harga: 8000, deskripsi: 'Puding coklat dengan fla', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Brownies Panggang', harga: 12000, deskripsi: 'Kue brownies lembut', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Singkong Keju', harga: 9000, deskripsi: 'Singkong goreng dengan parutan keju', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Lemper Ayam', harga: 7000, deskripsi: 'Ketan isi ayam suwir', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Pastel Isi Sayur', harga: 8000, deskripsi: 'Pastel goreng isi sayur dan telur', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Sosis Bakar', harga: 10000, deskripsi: 'Sosis panggang dengan saus', status: 'tersedia', kategori: 'lainnya' },
    { nama_menu: 'Pisang Coklat', harga: 9500, deskripsi: 'Pisang goreng isi coklat', status: 'tersedia', kategori: 'lainnya' }
  ]);

  // Stok Bahan
  await knex('stok_bahan').insert([
    { nama_bahan: 'Ayam Fillet', jumlah_stok: 7, satuan: 'kg', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Minyak Goreng', jumlah_stok: 10, satuan: 'liter', jenis: 'bumbu', status: 'hampir habis' },
    { nama_bahan: 'Gula Pasir', jumlah_stok: 6, satuan: 'kg', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Keranjang Kuning', jumlah_stok: 10, satuan: 'pcs', jenis: 'lainnya', status: 'tersedia' },
    { nama_bahan: 'ketumbar', jumlah_stok: 5, satuan: 'kg', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Nasi', jumlah_stok: 50, satuan: 'gram', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Telur', jumlah_stok: 30, satuan: 'butir', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Kecap Manis', jumlah_stok: 10, satuan: 'ml', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Teh Celup', jumlah_stok: 20, satuan: 'kantong', jenis: 'minuman', status: 'tersedia' },
    { nama_bahan: 'Gula Pasir', jumlah_stok: 100, satuan: 'gram', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Es Batu', jumlah_stok: 100, satuan: 'bongkah', jenis: 'minuman', status: 'tersedia' },
    { nama_bahan: 'Ayam Fillet', jumlah_stok: 15, satuan: 'potong', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Garam', jumlah_stok: 200, satuan: 'gram', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Minyak Goreng', jumlah_stok: 5, satuan: 'liter', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Sambal', jumlah_stok: 3, satuan: 'botol', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Tempe', jumlah_stok: 20, satuan: 'potong', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Tahu', jumlah_stok: 20, satuan: 'potong', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Daun Bawang', jumlah_stok: 30, satuan: 'batang', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Bawang Merah', jumlah_stok: 50, satuan: 'siung', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Bawang Putih', jumlah_stok: 50, satuan: 'siung', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Cabe Merah', jumlah_stok: 100, satuan: 'gram', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Kopi Bubuk', jumlah_stok: 10, satuan: 'bungkus', jenis: 'minuman', status: 'tersedia' },
    { nama_bahan: 'Susu Kental Manis', jumlah_stok: 6, satuan: 'kaleng', jenis: 'minuman', status: 'tersedia' },
    { nama_bahan: 'Margarin', jumlah_stok: 5, satuan: 'pak', jenis: 'bumbu', status: 'tersedia' },
    { nama_bahan: 'Sosis', jumlah_stok: 25, satuan: 'batang', jenis: 'makanan', status: 'tersedia' },
    { nama_bahan: 'Korong', jumlah_stok: 100, satuan: 'kg', jenis: 'makanan', status: 'tersedia' }
  ]);

  // Meja
  await knex('meja').insert([
    { no_meja: 1, status: 'tersedia', kapasitas: 4 },
    { no_meja: 2, status: 'digunakan', kapasitas: 2 },
    { no_meja: 3, status: 'tersedia', kapasitas: 6 },
    { no_meja: 4, status: 'rusak', kapasitas: 4 },
    { no_meja: 5, status: 'digunakan', kapasitas: 5 },
    { no_meja: 6, status: 'tersedia', kapasitas: 3 },
    { no_meja: 7, status: 'tersedia', kapasitas: 4 },
    { no_meja: 8, status: 'digunakan', kapasitas: 6 },
    { no_meja: 9, status: 'digunakan', kapasitas: 4 },
    { no_meja: 10, status: 'digunakan', kapasitas: 2 },
    { no_meja: 11, status: 'digunakan', kapasitas: 4 },
    { no_meja: 12, status: 'rusak', kapasitas: 5 },
    { no_meja: 13, status: 'digunakan', kapasitas: 6 },
    { no_meja: 14, status: 'tersedia', kapasitas: 4 },
    { no_meja: 15, status: 'digunakan', kapasitas: 2 },
    { no_meja: 16, status: 'tersedia', kapasitas: 100 }
  ]);

  // Bahan Menu
  await knex('bahan_menu').insert([
    { id_menu: 'MN001', id_stok: 'ST001', jumlah: 100, satuan: 'gram' },
    { id_menu: 'MN001', id_stok: 'ST002', jumlah: 1, satuan: 'butir' },
    { id_menu: 'MN001', id_stok: 'ST003', jumlah: 2, satuan: 'sendok' },
    { id_menu: 'MN001', id_stok: 'ST008', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN002', id_stok: 'ST004', jumlah: 1, satuan: 'kantong' },
    { id_menu: 'MN002', id_stok: 'ST005', jumlah: 2, satuan: 'sendok' },
    { id_menu: 'MN002', id_stok: 'ST006', jumlah: 3, satuan: 'bongkah' },
    { id_menu: 'MN003', id_stok: 'ST007', jumlah: 1, satuan: 'potong' },
    { id_menu: 'MN003', id_stok: 'ST003', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN003', id_stok: 'ST008', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN003', id_stok: 'ST010', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN004', id_stok: 'ST011', jumlah: 1, satuan: 'potong' },
    { id_menu: 'MN004', id_stok: 'ST008', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN004', id_stok: 'ST009', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN005', id_stok: 'ST017', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN005', id_stok: 'ST018', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN005', id_stok: 'ST005', jumlah: 1, satuan: 'sendok' },
    { id_menu: 'MN005', id_stok: 'ST006', jumlah: 2, satuan: 'bongkah' }
  ]);

  // Pesanan
  await knex('pesanan').insert([
    { nama_pemesan: 'Rudi Hartono', no_antrian: 1, tipe_pesanan: 'dine_in', id_meja: 'MJ001', status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Ayu Lestari', no_antrian: 2, tipe_pesanan: 'dine_in', id_meja: 'MJ002', status: 'sedang dimasak', status_pembayaran: 'belum_dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Budi Santoso', no_antrian: 3, tipe_pesanan: 'dine_in', id_meja: 'MJ003', status: 'selesai', status_pembayaran: 'dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Siti Aminah', no_antrian: 4, tipe_pesanan: 'dine_in', id_meja: 'MJ004', status: 'selesai', status_pembayaran: 'dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Ahmad Fauzi', no_antrian: 5, tipe_pesanan: 'take_away', id_meja: null, status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Dewi Kartika', no_antrian: 6, tipe_pesanan: 'take_away', id_meja: null, status: 'selesai', status_pembayaran: 'dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Joko Widodo', no_antrian: 7, tipe_pesanan: 'take_away', id_meja: null, status: 'selesai', status_pembayaran: 'dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Indah Permatasari', no_antrian: 8, tipe_pesanan: 'reservasi', id_meja: 'MJ005', status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Slamet Raharjo', no_antrian: 9, tipe_pesanan: 'reservasi', id_meja: 'MJ006', status: 'selesai', status_pembayaran: 'dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Mira Susanti', no_antrian: 10, tipe_pesanan: 'reservasi', id_meja: 'MJ007', status: 'selesai', status_pembayaran: 'dibayar', created_at: '2025-07-19 14:57:00' },
    { nama_pemesan: 'Kucing Garong', no_antrian: 11, tipe_pesanan: 'dine_in', id_meja: 'MJ002', status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-28 11:21:22' },
    { nama_pemesan: 'Ketupat garing', no_antrian: 12, tipe_pesanan: 'dine_in', id_meja: 'MJ010', status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-28 11:25:32' },
    { nama_pemesan: 'Ketupat garing', no_antrian: 13, tipe_pesanan: 'dine_in', id_meja: 'MJ008', status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-28 11:25:56' },
    { nama_pemesan: 'Kucing Garong', no_antrian: 14, tipe_pesanan: 'dine_in', id_meja: 'MJ013', status: 'dalam antrian', status_pembayaran: 'belum_dibayar', created_at: '2025-07-29 12:35:33' }
  ]);

  // Detail Pesanan
  await knex('detail_pesanan').insert([
    { id_pesanan: 'PSN001', id_menu: 'MN001', jumlah: 2, catatan: 'Pedas sedang', status_masak: 'selesai' },
    { id_pesanan: 'PSN001', id_menu: 'MN008', jumlah: 1, catatan: 'Tanpa es', status_masak: 'selesai' },
    { id_pesanan: 'PSN002', id_menu: 'MN002', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN002', id_menu: 'MN010', jumlah: 2, catatan: 'Untuk anak-anak', status_masak: 'belum' },
    { id_pesanan: 'PSN003', id_menu: 'MN003', jumlah: 2, catatan: 'Jangan terlalu asin', status_masak: 'belum' },
    { id_pesanan: 'PSN003', id_menu: 'MN009', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN004', id_menu: 'MN005', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN004', id_menu: 'MN006', jumlah: 1, catatan: 'Gula dikurangi', status_masak: 'belum' },
    { id_pesanan: 'PSN005', id_menu: 'MN004', jumlah: 3, catatan: 'Porsi besar', status_masak: 'belum' },
    { id_pesanan: 'PSN006', id_menu: 'MN007', jumlah: 2, catatan: 'Pakai banyak kuah', status_masak: 'belum' },
    { id_pesanan: 'PSN006', id_menu: 'MN002', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN007', id_menu: 'MN001', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN007', id_menu: 'MN003', jumlah: 1, catatan: 'Kecap tambahan', status_masak: 'belum' },
    { id_pesanan: 'PSN008', id_menu: 'MN006', jumlah: 2, catatan: 'Dingin', status_masak: 'belum' },
    { id_pesanan: 'PSN009', id_menu: 'MN004', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN010', id_menu: 'MN005', jumlah: 1, catatan: null, status_masak: 'belum' },
    { id_pesanan: 'PSN010', id_menu: 'MN008', jumlah: 1, catatan: 'Sedikit gula', status_masak: 'belum' },
    { id_pesanan: 'PSN012', id_menu: 'MN032', jumlah: 1, catatan: '', status_masak: 'selesai' },
    { id_pesanan: 'PSN012', id_menu: 'MN043', jumlah: 1, catatan: '', status_masak: 'selesai' },
    { id_pesanan: 'PSN013', id_menu: 'MN014', jumlah: 1, catatan: '', status_masak: 'selesai' },
    { id_pesanan: 'PSN013', id_menu: 'MN035', jumlah: 1, catatan: '', status_masak: 'selesai' },
    { id_pesanan: 'PSN013', id_menu: 'MN045', jumlah: 1, catatan: '', status_masak: 'selesai' },
    { id_pesanan: 'PSN014', id_menu: 'MN043', jumlah: 1, catatan: '', status_masak: 'belum' },
    { id_pesanan: 'PSN014', id_menu: 'MN015', jumlah: 1, catatan: '', status_masak: 'belum' }
  ]);

  // Reservasi
  await knex('reservasi').insert([
    { nama_pemesan: 'Giga', no_telp: '081234567890', jml_orang: 4, catatan: 'Permintaan dekat jendela', tanggal: '2025-06-20', waktu: '18:30:00', status: 'pending', id_pesanan: null },
    { nama_pemesan: 'Kutu Kupret', no_telp: '0812304044', jml_orang: 50, catatan: 'ingin di bawah tanah yaa', tanggal: '2025-06-20', waktu: '20:01:30', status: 'selesai', id_pesanan: null },
    { nama_pemesan: 'Rahmat', no_telp: '0981923821938', jml_orang: 10, catatan: 'saya ingin di dekat surga', tanggal: '2025-06-28', waktu: '17:22:00', status: 'pending', id_pesanan: null },
    { nama_pemesan: 'korong', no_telp: '081220875501', jml_orang: 2, catatan: 'saya ingin dekat neraka', tanggal: '2025-07-31', waktu: '20:50:00', status: 'pending', id_pesanan: null },
    { nama_pemesan: 'Icikiwir manjha', no_telp: '098192432234', jml_orang: 3, catatan: 'Saya ingin Mengubah Rencana Banjaran', tanggal: '2025-07-31', waktu: '00:30:00', status: 'pending', id_pesanan: null }
  ]);

  // Detail Transaksi
  await knex('detail_transaksi').insert([
    { id_user: 13, id_pesanan: 'PSN004', metode_pembayaran: 'cash', total: 29000, diskon: 0, kembalian: null },
    { id_user: 13, id_pesanan: 'PSN007', metode_pembayaran: 'cash', total: 43000, diskon: 0, kembalian: null },
    { id_user: 13, id_pesanan: 'PSN009', metode_pembayaran: 'cash', total: 22000, diskon: 0, kembalian: null },
    { id_user: 13, id_pesanan: 'PSN003', metode_pembayaran: 'qris', total: 74000, diskon: 1000, kembalian: 0 },
    { id_user: 13, id_pesanan: 'PSN010', metode_pembayaran: 'cash', total: 30000, diskon: 3000, kembalian: 20000 },
    { id_user: 13, id_pesanan: 'PSN006', metode_pembayaran: 'transfer', total: 49000, diskon: 0, kembalian: 0 }
  ]);
};