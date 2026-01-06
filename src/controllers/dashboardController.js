// Import SEMUA Model yang dibutuhkan
const Transaksi = require('../models/transaksiModel');
const Menu = require('../models/menuModel');
const Pesanan = require('../models/pesananModel');
const User = require('../models/userModel');
const Meja = require('../models/mejaModel');
const DetailPesanan = require('../models/detailPesananModel');
const StokBahan = require('../models/stokBahanModel');
const Reservasi = require('../models/reservasiModel');

exports.index = async (req, res) => {
    try {
        const user = req.user; // Didapat dari middleware verifyToken
        const role = user.role;
        
        let dashboardData = {};

        switch (role) {
            case 'admin':
                // --- ADMIN DASHBOARD ---
                // Gunakan Promise.all agar query jalan paralel (lebih cepat)
                const [
                    totalTransaksi,
                    totalMenu,
                    totalPesanan,
                    totalPegawai,
                    revToday,
                    revWeek,
                    revMonth,
                    revTotal,
                    recentActivities,
                    chartDataRaw
                ] = await Promise.all([
                    Transaksi.countAll(),
                    Menu.countAll(),
                    Pesanan.countAll(),
                    User.countByRole(['kasir', 'koki', 'pelayan']),
                    Transaksi.getRevenueToday(),
                    Transaksi.getRevenueWeek(),
                    Transaksi.getRevenueMonth(),
                    Transaksi.getTotalRevenue(),
                    Pesanan.getRecentActivities(5),
                    Transaksi.getRevenueChartData(7)
                ]);

                // Format Chart Data (Mengisi tanggal yang kosong dengan 0)
                const chartData = processChartData(chartDataRaw, 7);

                dashboardData = {
                    stats: {
                        total_transaksi: totalTransaksi,
                        total_menu: totalMenu,
                        total_pesanan: totalPesanan,
                        total_pegawai: totalPegawai
                    },
                    revenue: {
                        today: revToday,
                        week: revWeek,
                        month: revMonth,
                        total: revTotal
                    },
                    recent_activities: recentActivities,
                    revenue_chart: chartData
                };
                break;

            case 'pelayan':
                // --- PELAYAN DASHBOARD ---
                const [activeOrders, tableStatus, upcomingReservations] = await Promise.all([
                    Pesanan.getActiveOrders(),
                    Meja.all(),
                    Reservasi.getUpcoming(5)
                ]);

                dashboardData = {
                    active_orders: activeOrders,
                    tables: tableStatus,
                    reservations: upcomingReservations
                };
                break;

            case 'kasir':
                // --- KASIR DASHBOARD ---
                const [pendingPayments, revenueToday, recentTrans] = await Promise.all([
                    Pesanan.getBelumDibayar(),
                    Transaksi.getRevenueByKasirToday(user.id),
                    Transaksi.getRecentByKasir(user.id, 5)
                ]);

                dashboardData = {
                    pending_payments: pendingPayments,
                    revenue_today: revenueToday,
                    recent_transactions: recentTrans
                };
                break;

            case 'koki':
                // --- KOKI DASHBOARD ---
                const [cookingItems, lowStock, unavailableMenu] = await Promise.all([
                    DetailPesanan.getBelumMasak(),
                    StokBahan.getLowStock(),
                    Menu.getUnavailable() // Menu yg statusnya 'tidak tersedia'
                ]);

                dashboardData = {
                    cooking_tasks: cookingItems,
                    low_stock: lowStock,
                    unavailable_menu: unavailableMenu
                };
                break;

            default:
                return res.status(403).json({ message: "Role tidak dikenali" });
        }

        res.status(200).json({
            success: true,
            role: role,
            data: dashboardData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal memuat dashboard: " + error.message });
    }
};

// Helper: Mengisi tanggal kosong dengan 0 untuk Chart
function processChartData(dbRows, days) {
    const dataMap = {};
    // Pindahkan data DB ke Map agar mudah dicari
    dbRows.forEach(row => {
        // row.tanggal biasanya object Date, kita ubah ke string YYYY-MM-DD
        const dateStr = new Date(row.tanggal).toISOString().split('T')[0];
        dataMap[dateStr] = parseFloat(row.total);
    });

    const labels = [];
    const totals = [];

    // Loop mundur dari hari ini ke 7 hari lalu
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        
        // Ambil nama hari (Sen, Sel, ...)
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' }); 
        
        labels.push(dayName); // Label: "Sen", "Sel"
        totals.push(dataMap[dateKey] || 0); // Total: 50000 atau 0
    }

    return { labels, totals };
}