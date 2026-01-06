const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Pastikan folder 'public/uploads' sudah dibuat di root project
        cb(null, 'public/uploads/'); 
    },
    filename: function (req, file, cb) {
        // Generate nama unik: timestamp_namapalsu.jpg (Logic PHP line 248)
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter file (Hanya gambar)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;