/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. CREATE TABLES (Urutan penting karena Foreign Key)

  // Users
  await knex.schema.createTable('users', table => {
    table.increments('id_user').primary();
    table.string('nama', 255).notNullable();
    table.enum('gender', ['laki-laki', 'perempuan']).defaultTo('laki-laki');
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('no_telp', 255).nullable();
    table.enum('role', ['admin', 'kasir', 'koki', 'pelayan']).notNullable();
    table.string('fcm_token', 255).nullable(); // Tambahan untuk Mobile
    table.timestamps(true, true);
  });

  // Menu
  await knex.schema.createTable('menu', table => {
    table.string('id_menu', 10).primary();
    table.string('nama_menu', 255).notNullable();
    table.integer('harga').notNullable();
    table.text('deskripsi').nullable();
    table.string('foto', 255).nullable();
    table.enum('status', ['tersedia', 'tidak tersedia']).defaultTo('tersedia');
    table.enum('kategori', ['makanan', 'minuman', 'lainnya']).defaultTo('makanan');
    table.timestamps(true, true);
  });

  // Stok Bahan
  await knex.schema.createTable('stok_bahan', table => {
    table.string('id_stok', 10).primary();
    table.string('nama_bahan', 255).notNullable();
    table.integer('jumlah_stok').notNullable();
    table.string('satuan', 255).notNullable();
    table.enum('jenis', ['makanan', 'minuman', 'bumbu', 'lainnya']).notNullable();
    table.enum('status', ['tersedia', 'hampir habis', 'habis']).defaultTo('tersedia');
    table.timestamps(true, true);
  });

  // Meja
  await knex.schema.createTable('meja', table => {
    table.string('id_meja', 10).primary();
    table.integer('no_meja').notNullable().unique();
    table.enum('status', ['tersedia', 'digunakan', 'rusak']).defaultTo('tersedia');
    table.integer('kapasitas').notNullable();
    table.timestamps(true, true);
  });

  // Pesanan
  await knex.schema.createTable('pesanan', table => {
    table.string('id_pesanan', 10).primary();
    table.string('nama_pemesan', 255).notNullable();
    table.integer('no_antrian').notNullable();
    table.enum('tipe_pesanan', ['dine_in', 'take_away', 'reservasi']).notNullable();
    table.string('id_meja', 10).nullable().references('id_meja').inTable('meja').onDelete('SET NULL');
    table.enum('status', ['dalam antrian', 'sedang dimasak', 'selesai', 'dibatalkan']).defaultTo('dalam antrian');
    table.enum('status_pembayaran', ['belum_dibayar', 'dibayar']).defaultTo('belum_dibayar');
    table.timestamps(true, true);
  });

  // Bahan Menu (Relasi)
  await knex.schema.createTable('bahan_menu', table => {
    table.string('id_bahan_menu', 10).primary();
    table.string('id_menu', 10).notNullable().references('id_menu').inTable('menu').onDelete('CASCADE');
    table.string('id_stok', 10).notNullable().references('id_stok').inTable('stok_bahan').onDelete('CASCADE');
    table.integer('jumlah').defaultTo(1);
    table.string('satuan', 50).nullable();
    table.timestamps(true, true);
  });

  // Detail Pesanan
  await knex.schema.createTable('detail_pesanan', table => {
    table.string('id_detail', 10).primary();
    table.string('id_pesanan', 10).notNullable().references('id_pesanan').inTable('pesanan').onDelete('CASCADE');
    table.string('id_menu', 10).notNullable().references('id_menu').inTable('menu').onDelete('CASCADE');
    table.integer('jumlah').defaultTo(1);
    table.text('catatan').nullable();
    table.enum('status_masak', ['belum', 'sedang', 'selesai']).defaultTo('belum');
    table.timestamps(true, true);
  });

  // Reservasi
  await knex.schema.createTable('reservasi', table => {
    table.string('id_reservasi', 10).primary();
    table.string('nama_pemesan', 255).notNullable();
    table.string('no_telp', 255).notNullable();
    table.integer('jml_orang').notNullable();
    table.text('catatan').nullable();
    table.date('tanggal').notNullable();
    table.time('waktu').notNullable();
    table.enum('status', ['pending', 'disetujui', 'dibatalkan', 'selesai']).defaultTo('pending');
    table.string('id_pesanan', 10).nullable().references('id_pesanan').inTable('pesanan').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // Detail Transaksi
  await knex.schema.createTable('detail_transaksi', table => {
    table.string('id_transaksi', 10).primary();
    table.integer('id_user').unsigned().notNullable().references('id_user').inTable('users').onDelete('CASCADE');
    table.string('id_pesanan', 10).notNullable().references('id_pesanan').inTable('pesanan').onDelete('CASCADE');
    table.enum('metode_pembayaran', ['cash', 'debit', 'qris', 'transfer', 'lainnya']).notNullable();
    table.integer('total').notNullable();
    table.integer('diskon').defaultTo(0);
    table.integer('kembalian').nullable();
    table.timestamps(true, true);
  });

  // 2. CREATE TRIGGERS (Agar ID otomatis seperti MN001, ST001)
  const triggers = [
    `CREATE TRIGGER before_insert_menu BEFORE INSERT ON menu FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_menu, 3) AS UNSIGNED)), 0) + 1 INTO next_id FROM menu; SET NEW.id_menu = CONCAT('MN', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_stok_bahan BEFORE INSERT ON stok_bahan FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_stok, 3) AS UNSIGNED)), 0) + 1 INTO next_id FROM stok_bahan; SET NEW.id_stok = CONCAT('ST', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_meja BEFORE INSERT ON meja FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_meja, 3) AS UNSIGNED)), 0) + 1 INTO next_id FROM meja; SET NEW.id_meja = CONCAT('MJ', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_bahan_menu BEFORE INSERT ON bahan_menu FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_bahan_menu, 3) AS UNSIGNED)), 0) + 1 INTO next_id FROM bahan_menu; SET NEW.id_bahan_menu = CONCAT('BM', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_pesanan BEFORE INSERT ON pesanan FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_pesanan, 4) AS UNSIGNED)), 0) + 1 INTO next_id FROM pesanan; SET NEW.id_pesanan = CONCAT('PSN', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_detail_pesanan BEFORE INSERT ON detail_pesanan FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_detail, 4) AS UNSIGNED)), 0) + 1 INTO next_id FROM detail_pesanan; SET NEW.id_detail = CONCAT('DTL', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_reservasi BEFORE INSERT ON reservasi FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_reservasi, 4) AS UNSIGNED)), 0) + 1 INTO next_id FROM reservasi; SET NEW.id_reservasi = CONCAT('RSV', LPAD(next_id, 3, '0')); END`,
    `CREATE TRIGGER before_insert_detail_transaksi BEFORE INSERT ON detail_transaksi FOR EACH ROW BEGIN DECLARE next_id INT; SELECT IFNULL(MAX(CAST(SUBSTRING(id_transaksi, 3) AS UNSIGNED)), 0) + 1 INTO next_id FROM detail_transaksi; SET NEW.id_transaksi = CONCAT('TR', LPAD(next_id, 3, '0')); END`
  ];

  for (const sql of triggers) {
    await knex.raw(sql);
  }
};

exports.down = async function(knex) {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('detail_transaksi');
  await knex.schema.dropTableIfExists('reservasi');
  await knex.schema.dropTableIfExists('detail_pesanan');
  await knex.schema.dropTableIfExists('bahan_menu');
  await knex.schema.dropTableIfExists('pesanan');
  await knex.schema.dropTableIfExists('meja');
  await knex.schema.dropTableIfExists('stok_bahan');
  await knex.schema.dropTableIfExists('menu');
  await knex.schema.dropTableIfExists('users');
};