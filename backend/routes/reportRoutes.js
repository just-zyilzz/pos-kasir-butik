const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const sheetsService = require('../services/sheetsService');
const fs = require('fs');
const path = require('path');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate PDF report
router.post('/pdf', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const transactions = await sheetsService.getTransactions(startDate, endDate);

        const doc = new PDFDocument();
        const filename = `sales-report-${Date.now()}.pdf`;
        const filepath = path.join(reportsDir, filename);

        doc.pipe(fs.createWriteStream(filepath));

        // Header
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Period: ${startDate || 'All'} - ${endDate || 'All'}`, { align: 'center' });
        doc.moveDown();

        // Summary
        const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
        const totalProfit = transactions.reduce((sum, t) => sum + t.keuntungan, 0);

        doc.fontSize(14).text('Summary', { underline: true });
        doc.fontSize(11).text(`Total Transactions: ${transactions.length}`);
        doc.text(`Total Sales: Rp ${totalSales.toLocaleString('id-ID')}`);
        doc.text(`Total Profit: Rp ${totalProfit.toLocaleString('id-ID')}`);
        doc.moveDown();

        // Transaction details
        doc.fontSize(14).text('Transaction Details', { underline: true });
        doc.moveDown(0.5);

        transactions.forEach((t, index) => {
            doc.fontSize(10);
            doc.text(`${index + 1}. ${t.tanggal} | ${t.nama} (${t.sku})`);
            doc.text(`   Qty: ${t.qty} | Price: Rp ${t.hargaJual.toLocaleString('id-ID')} | Total: Rp ${t.total.toLocaleString('id-ID')} | Profit: Rp ${t.keuntungan.toLocaleString('id-ID')}`);
            doc.moveDown(0.3);
        });

        doc.end();

        doc.on('finish', () => {
            res.download(filepath, filename, (err) => {
                if (err) {
                    console.error('Error downloading PDF:', err);
                }
                // Clean up file after download
                setTimeout(() => {
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                    }
                }, 60000);
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Generate Excel report
router.post('/excel', async (req, res) => {
    try {
        const { startDate, endDate } = req.body;
        const transactions = await sheetsService.getTransactions(startDate, endDate);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Header
        worksheet.columns = [
            { header: 'Date', key: 'tanggal', width: 15 },
            { header: 'SKU', key: 'sku', width: 15 },
            { header: 'Product', key: 'nama', width: 30 },
            { header: 'Qty', key: 'qty', width: 10 },
            { header: 'Price', key: 'hargaJual', width: 15 },
            { header: 'HPP', key: 'hpp', width: 15 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Profit', key: 'keuntungan', width: 15 },
        ];

        // Style header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' },
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Add data
        transactions.forEach(t => {
            worksheet.addRow(t);
        });

        // Add summary
        worksheet.addRow([]);
        const summaryRow = worksheet.addRow([
            'TOTAL',
            '',
            '',
            transactions.reduce((sum, t) => sum + t.qty, 0),
            '',
            '',
            transactions.reduce((sum, t) => sum + t.total, 0),
            transactions.reduce((sum, t) => sum + t.keuntungan, 0),
        ]);
        summaryRow.font = { bold: true };

        const filename = `sales-report-${Date.now()}.xlsx`;
        const filepath = path.join(reportsDir, filename);

        await workbook.xlsx.writeFile(filepath);

        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('Error downloading Excel:', err);
            }
            // Clean up file after download
            setTimeout(() => {
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
            }, 60000);
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
