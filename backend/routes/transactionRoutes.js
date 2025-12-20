const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');

// Create new transaction
router.post('/', async (req, res) => {
    try {
        const { items, paymentMethod, customerInfo } = req.body;

        // Validation
        if (!items || items.length === 0) return res.status(400).json({ success: false, error: 'No items provided' });
        if (!paymentMethod) return res.status(400).json({ success: false, error: 'Invalid payment method' });
        if (paymentMethod === 'debt' && (!customerInfo || !customerInfo.name)) {
            return res.status(400).json({ success: false, error: 'Customer Name is required for Debt transactions' });
        }

        // 1. Batch Fetch Products (Optimization)
        const allProducts = await sheetsService.getAllProducts();
        const productMap = new Map(allProducts.map(p => [p.sku, p]));

        const transactionDate = new Date().toISOString().split('T')[0];
        const processedItems = [];
        let totalTransaction = 0;

        // 2. Pre-flight Stock Validation
        for (const item of items) {
            const product = productMap.get(item.sku);
            if (!product) return res.status(404).json({ success: false, error: `Product ${item.sku} not found` });
            if (product.stokSekarang < item.qty) {
                return res.status(400).json({ success: false, error: `Insufficient stock for ${product.nama}` });
            }

            const total = product.hargaJual * item.qty;
            processedItems.push({
                product,
                qty: item.qty,
                transactionData: {
                    tanggal: transactionDate,
                    sku: product.sku,
                    nama: product.nama,
                    qty: item.qty,
                    hargaJual: product.hargaJual,
                    hpp: product.hpp,
                    total: total,
                    keuntungan: total - (product.hpp * item.qty),
                }
            });
            totalTransaction += total;
        }

        // 3. Record Debt (If Applicable)
        if (paymentMethod === 'debt') {
            const defaultDueDate = new Date();
            defaultDueDate.setDate(defaultDueDate.getDate() + 30);
            await sheetsService.addDebt({
                namaPenghutang: customerInfo.name,
                totalHutang: totalTransaction,
                sisaHutang: totalTransaction,
                cicilanPerBulan: 0,
                tanggalJatuhTempo: customerInfo.dueDate || defaultDueDate.toISOString().split('T')[0],
                catatan: customerInfo.notes || `POS Transaction`
            });
        }

        // 4. Execute Writes (Append Transaction & Update Stock)
        const results = [];
        for (const item of processedItems) {
            await sheetsService.appendTransaction(item.transactionData);
            const newStock = item.product.stokSekarang - item.qty;
            await sheetsService.updateStock(item.product.sku, newStock);
            results.push({ ...item.transactionData, newStock });
        }

        res.json({ success: true, data: { items: results, totalAmount: totalTransaction } });
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