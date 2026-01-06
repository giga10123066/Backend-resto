const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id: 1, role: 'admin', ... }
        next();
    } catch (err) {
        return res.status(403).json({ message: "Token tidak valid atau kadaluarsa." });
    }
};

// --- TAMBAHAN BARU: Middleware Pengecekan Role ---
// Ini meniru fungsi Middleware::requireRole($role) di PHP Anda
const roleCheck = (allowedRoles) => {
    return (req, res, next) => {
        // req.user diset oleh verifyToken sebelumnya
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Akses Terlarang. Anda tidak memiliki izin untuk fitur ini." 
            });
        }
        next();
    };
};

module.exports = { verifyToken, roleCheck };