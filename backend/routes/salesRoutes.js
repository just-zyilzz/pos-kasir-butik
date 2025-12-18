const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');

// Get sales today
router.get('/today', async (req, res) => {
    try {
        const salesData = await sheetsService.getSalesToday();
        res.json({ success: true, data: salesData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get weekly sales (last 7 days with daily breakdown)
router.get('/weekly', async (req, res) => {
    try {
        const salesData = await sheetsService.getWeeklySales();
        res.json({ success: true, data: salesData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get monthly sales (last 30 days with weekly breakdown)
router.get('/monthly', async (req, res) => {
    try {
        const salesData = await sheetsService.getMonthlySales();
        res.json({ success: true, data: salesData });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get sales summary (today, week, month)
router.get('/summary', async (req, res) => {
    try {
        const today = await sheetsService.getSalesToday();
        const weekly = await sheetsService.getWeeklySales();
        const monthly = await sheetsService.getMonthlySales();

        res.json({
            success: true,
            data: {
                today: today,
                weekly: weekly,
                monthly: monthly
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
