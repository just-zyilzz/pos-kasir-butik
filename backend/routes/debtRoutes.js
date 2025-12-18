const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');

// GET /api/debts - Get all debts
router.get('/', async (req, res) => {
    try {
        const debts = await sheetsService.getAllDebts();
        res.json(debts);
    } catch (error) {
        console.error('Error fetching debts:', error);
        res.status(500).json({ error: 'Failed to fetch debts' });
    }
});

// GET /api/debts/:id - Get debt by ID
router.get('/:id', async (req, res) => {
    try {
        const debt = await sheetsService.getDebtById(req.params.id);
        if (!debt) {
            return res.status(404).json({ error: 'Debt not found' });
        }
        res.json(debt);
    } catch (error) {
        console.error('Error fetching debt:', error);
        res.status(500).json({ error: 'Failed to fetch debt' });
    }
});

// POST /api/debts - Add new debt
router.post('/', async (req, res) => {
    try {
        const { namaPenghutang, totalHutang, cicilanPerBulan, tanggalJatuhTempo, catatan } = req.body;

        // Validation
        if (!namaPenghutang || !totalHutang || !cicilanPerBulan || !tanggalJatuhTempo) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const debtData = {
            namaPenghutang,
            totalHutang: parseFloat(totalHutang),
            sisaHutang: parseFloat(totalHutang),
            cicilanPerBulan: parseFloat(cicilanPerBulan),
            tanggalJatuhTempo,
            catatan: catatan || ''
        };

        const result = await sheetsService.addDebt(debtData);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding debt:', error);
        res.status(500).json({ error: 'Failed to add debt' });
    }
});

// PUT /api/debts/:id - Update debt
router.put('/:id', async (req, res) => {
    try {
        const { namaPenghutang, totalHutang, cicilanPerBulan, tanggalJatuhTempo, catatan } = req.body;

        const updateData = {
            namaPenghutang,
            totalHutang: parseFloat(totalHutang),
            cicilanPerBulan: parseFloat(cicilanPerBulan),
            tanggalJatuhTempo,
            catatan
        };

        const result = await sheetsService.updateDebt(req.params.id, updateData);
        if (!result) {
            return res.status(404).json({ error: 'Debt not found' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error updating debt:', error);
        res.status(500).json({ error: 'Failed to update debt' });
    }
});

// POST /api/debts/:id/payment - Record payment
router.post('/:id/payment', async (req, res) => {
    try {
        const { jumlahPembayaran, tanggalPembayaran } = req.body;

        if (!jumlahPembayaran) {
            return res.status(400).json({ error: 'Payment amount is required' });
        }

        const result = await sheetsService.recordPayment(
            req.params.id,
            parseFloat(jumlahPembayaran),
            tanggalPembayaran || new Date().toISOString().split('T')[0]
        );

        if (!result) {
            return res.status(404).json({ error: 'Debt not found' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
});

// DELETE /api/debts/:id - Delete debt
router.delete('/:id', async (req, res) => {
    try {
        const result = await sheetsService.deleteDebt(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Debt not found' });
        }
        res.json({ message: 'Debt deleted successfully' });
    } catch (error) {
        console.error('Error deleting debt:', error);
        res.status(500).json({ error: 'Failed to delete debt' });
    }
});

module.exports = router;
