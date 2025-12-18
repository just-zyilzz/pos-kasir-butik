const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');

// Create new transaction
router.post('/', async (req, res) => {
    try {
        const { items, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'No items provided' });
        }

        if (!paymentMethod || !['cash', 'debt'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, error: 'Invalid payment method' });
        }

        const transactionDate = new Date().toISOString().split('T')[0];
        const results = [];

        for (const item of items) {
            const { sku, qty } = item;

            // Get product info
            const product = await sheetsService.getProductBySKU(sku);
            if (!product) {
                return res.status(404).json({ success: false, error: `Product ${sku} not found` });
            }

            // Validate stock
            if (product.stokSekarang < qty) {
                return res.status(400).json({
                    success: false,
                    error: `Insufficient stock for ${product.nama}. Available: ${product.stokSekarang}, Requested: ${qty}`
                });
            }

            // Calculate transaction values
            const total = product.hargaJual * qty;
            const totalHPP = product.hpp * qty;
            const keuntungan = total - totalHPP;

            // Prepare transaction log entry
            const transaction = {
                tanggal: transactionDate,
                sku: product.sku,
                nama: product.nama,
                qty: qty,
                hargaJual: product.hargaJual,
                hpp: product.hpp,
                total: total,
                keuntungan: keuntungan,
            };

            // Append to transaction log
            await sheetsService.appendTransaction(transaction);

            // Update stock
            const newStock = product.stokSekarang - qty;
            await sheetsService.updateStock(sku, newStock);

            results.push({
                ...transaction,
                newStock: newStock,
            });
        }

        res.json({
            success: true,
            data: {
                paymentMethod,
                date: transactionDate,
                items: results,
                totalAmount: results.reduce((sum, item) => sum + item.total, 0),
                totalProfit: results.reduce((sum, item) => sum + item.keuntungan, 0),
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const transactions = await sheetsService.getTransactions(startDate, endDate);
        res.json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
