const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("👉 Login Attempt:");
        console.log("   Email:", email);
        console.log("   Password Input:", password);

        // 1. Cari User by Email
        const user = await User.findByEmail(email);
        if (!user) {
            console.log("❌ User tidak ditemukan di DB");
            return res.status(404).json({ success: false, message: "Email tidak ditemukan" });
        }

        console.log("✅ User ditemukan:", user.nama);
        console.log("   Hash di DB:", user.password);

        // 2. Cek Password
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log("❓ Password Match?", isMatch);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Password salah" });
        }

        // 3. Generate Token JWT (Pengganti Session)
        const token = jwt.sign(
            { id: user.id_user, role: user.role, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token berlaku 1 hari
        );

        // 4. Response JSON ke Flutter
        res.status(200).json({
            success: true,
            message: "Login berhasil",
            token: token,
            user: {
                id: user.id_user,
                nama: user.nama,
                role: user.role,
                email: user.email
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { nama, gender, email, password, no_telp, role } = req.body;

        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            nama, gender, email, no_telp, role,
            password: hashedPassword
        };

        const newUserId = await User.create(userData);

        res.status(201).json({
            success: true,
            message: "User berhasil didaftarkan",
            userId: newUserId
        });

    } catch (error) {
        res.status(500).json({ message: "Gagal register", error: error.message });
    }
};