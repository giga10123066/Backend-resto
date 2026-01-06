const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  console.log("🌱 Memulai Seeding (Hanya Users)...");

  // 1. Matikan Foreign Key Checks sementara (agar bisa delete data tanpa urutan ribet)
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

  // 2. Bersihkan SEMUA tabel
  await knex('detail_transaksi').truncate();
  await knex('reservasi').truncate();
  await knex('detail_pesanan').truncate();
  await knex('bahan_menu').truncate();
  await knex('pesanan').truncate();
  await knex('meja').truncate();
  await knex('stok_bahan').truncate();
  await knex('menu').truncate();
  await knex('users').truncate();

  // 3. Hidupkan kembali Foreign Key Checks
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');

  // 4. Hash Password (password123)
  const passwordHash = await bcrypt.hash('password123', 10);

  // 5. Insert Users Saja
  await knex('users').insert([
    { 
      nama: 'Admin Utama', 
      gender: 'laki-laki', 
      email: 'admin@gmail.com', 
      password: passwordHash, 
      no_telp: '081234567890', 
      role: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      nama: 'Kasir Satu', 
      gender: 'laki-laki', 
      email: 'kasir@gmail.com', 
      password: passwordHash, 
      no_telp: '081234567891', 
      role: 'kasir',
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      nama: 'Koki Hebat', 
      gender: 'laki-laki', 
      email: 'koki@gmail.com', 
      password: passwordHash, 
      no_telp: '081234567892', 
      role: 'koki',
      created_at: new Date(),
      updated_at: new Date()
    },
    { 
      nama: 'Pelayan Ramah', 
      gender: 'laki-laki', 
      email: 'pelayan@gmail.com', 
      password: passwordHash, 
      no_telp: '081234567893', 
      role: 'pelayan',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log("✅ Berhasil! Hanya tabel Users yang terisi.");
  console.log("📧 Email Admin: admin@gmail.com");
  console.log("🔑 Password: password123");
};