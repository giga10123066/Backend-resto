const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load Config
dotenv.config();

// Import Routes
const apiRoutes = require('./routes/api');

// Inisialisasi App
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan');
app.use(morgan('dev'))

// TAMBAHAN: Pastikan folder uploads ada
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📂 Folder 'public/uploads' berhasil dibuat otomatis.");
};

// ==========================================
// 1. MIDDLEWARE GLOBAL
// ==========================================

// CORS: Izinkan akses dari mana saja (Penting untuk Mobile/Flutter)
app.use(cors()); 

// Body Parser: Agar bisa baca input JSON dan Form-Data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==========================================
// 2. STATIC FILES (FOTO MENU)
// ==========================================
// Ini membuat folder 'public/uploads' bisa diakses lewat URL
// Contoh: http://localhost:3000/uploads/nasi_goreng.jpg
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ==========================================
// 3. ROUTING
// ==========================================
// Semua route API akan diawali dengan /api
// Contoh: http://localhost:3000/api/login
app.use('/api', apiRoutes);

// Route Default (Cek Server)
app.get('/', (req, res) => {
    res.send(`
        <h1>Backend Resto API is Running! 🚀</h1>
        <p>Gunakan endpoint <code>/api/...</code> untuk mengakses data.</p>
    `);
});

// ==========================================
// 4. GLOBAL ERROR HANDLER
// ==========================================
// Menangkap error JSON yang tidak valid atau error server lainnya
app.use((err, req, res, next) => {
    console.error("Global Error:", err.stack);
    
    // Jika error dari Multer (Upload)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: "Ukuran file terlalu besar (Max 2MB)" });
    }

    res.status(500).json({ 
        success: false, 
        message: "Terjadi kesalahan pada server (Internal Server Error)",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});


// ==========================================
// 5. JALANKAN SERVER
// ==========================================
app.listen(port, () => {
    console.log(`\n========================================`);
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
    console.log(`📂 Folder Upload: ${path.join(__dirname, '../public/uploads')}`);
    console.log(`========================================\n`);
});