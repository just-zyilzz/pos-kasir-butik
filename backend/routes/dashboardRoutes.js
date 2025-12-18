const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const dashboardData = await sheetsService.getDashboardData();
        const products = await sheetsService.getAllProducts();

        const totalStock = products.reduce((sum, p) => sum + p.stokSekarang, 0);
        const lowStockProducts = products.filter(p => p.stokSekarang < 10);

        res.json({
            success: true,
            data: {
                profits: dashboardData,
                inventory: {
                    totalStock,
                    lowStockCount: lowStockProducts.length,
                    lowStockProducts,
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get profit chart data
router.get('/profit-chart', async (req, res) => {
    try {
        const dashboardData = await sheetsService.getDashboardData();

        const chartData = [
            { period: 'Today', profit: dashboardData.today || 0 },
            { period: '7 Days', profit: dashboardData.last7Days || 0 },
            { period: '14 Days', profit: dashboardData.last14Days || 0 },
            { period: '21 Days', profit: dashboardData.last21Days || 0 },
            { period: '30 Days', profit: dashboardData.last30Days || 0 },
            { period: 'Monthly', profit: dashboardData.monthly || 0 },
        ];

        res.json({ success: true, data: chartData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
