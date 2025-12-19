const { google } = require('googleapis');

class SheetsService {
    constructor() {
        this.auth = new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            null,
            process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        if (!process.env.GOOGLE_PRIVATE_KEY) {
            console.warn('Warning: GOOGLE_PRIVATE_KEY is not defined in environment variables');
        }
        this.sheets = google.sheets({ version: 'v4', auth: this.auth });
        this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
        this.resolvedSheets = {};
    }

    async resolveSheetName(configName) {
        if (!configName) return configName;
        if (this.resolvedSheets[configName]) return this.resolvedSheets[configName];

        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheets = response.data.sheets || [];
            const match = sheets.find(s => s.properties.title.trim() === configName.trim());

            if (match) {
                console.log(`Resolved sheet name: "${configName}" -> "${match.properties.title}"`);
                this.resolvedSheets[configName] = match.properties.title;
                return match.properties.title;
            }
            return configName;
        } catch (error) {
            console.error('Error resolving sheet name:', error);
            return configName;
        }
    }

    async getAllProducts() {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_MASTER_BARANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:G`,
            });

            const rows = response.data.values || [];
            return rows.map(row => ({
                sku: row[0] || '',
                nama: row[1] || '',
                hpp: parseFloat(row[2]) || 0,
                hargaJual: parseFloat(row[3]) || 0,
                stokAwal: parseInt(row[4]) || 0,
                stokSekarang: parseInt(row[5]) || 0,
                imageUrl: row[6] || '',
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProductBySKU(sku) {
        try {
            const products = await this.getAllProducts();
            return products.find(p => p.sku === sku);
        } catch (error) {
            console.error('Error fetching product by SKU:', error);
            throw error;
        }
    }

    async updateStock(sku, newStock) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_MASTER_BARANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === sku);

            if (rowIndex === -1) {
                throw new Error('Product SKU not found');
            }

            const actualRowNumber = rowIndex + 2;
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!F${actualRowNumber}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [[newStock]],
                },
            });

            return true;
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    }

    async appendTransaction(transaction) {
        try {
            const values = [[
                transaction.tanggal,
                transaction.sku,
                transaction.nama,
                transaction.qty,
                transaction.hargaJual,
                transaction.hpp,
                transaction.total,
                transaction.keuntungan,
            ]];

            const sheetName = await this.resolveSheetName(process.env.SHEET_TRANSAKSI_LOG);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A:H`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error appending transaction:', error);
            throw error;
        }
    }

    async getTransactions(startDate = null, endDate = null) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_TRANSAKSI_LOG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:H`,
            });

            const rows = response.data.values || [];
            let transactions = rows.map(row => ({
                tanggal: row[0] || '',
                sku: row[1] || '',
                nama: row[2] || '',
                qty: parseInt(row[3]) || 0,
                hargaJual: parseFloat(row[4]) || 0,
                hpp: parseFloat(row[5]) || 0,
                total: parseFloat(row[6]) || 0,
                keuntungan: parseFloat(row[7]) || 0,
            }));

            if (startDate && endDate) {
                transactions = transactions.filter(t => {
                    const tDate = new Date(t.tanggal);
                    return tDate >= new Date(startDate) && tDate <= new Date(endDate);
                });
            }

            return transactions;
        } catch (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }
    }

    async getDashboardData() {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_DASHBOARD_WAKTU);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:B7`,
            });

            const rows = response.data.values || [];
            const data = {};

            rows.forEach(row => {
                const period = row[0] || '';
                const profit = parseFloat(row[1]) || 0;

                if (period.includes('Today') || period.includes('Hari Ini')) {
                    data.today = profit;
                } else if (period.includes('7')) {
                    data.last7Days = profit;
                } else if (period.includes('14')) {
                    data.last14Days = profit;
                } else if (period.includes('21')) {
                    data.last21Days = profit;
                } else if (period.includes('30')) {
                    data.last30Days = profit;
                } else if (period.includes('Month') || period.includes('Bulan')) {
                    data.monthly = profit;
                }
            });

            return data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            const { sku, nama, hpp, hargaJual, stokAwal, imageUrl } = productData;

            // Check if SKU already exists
            const existingProduct = await this.getProductBySKU(sku);
            if (existingProduct) {
                throw new Error('Product SKU already exists');
            }

            const values = [[
                sku,
                nama,
                hpp,
                hargaJual,
                stokAwal,
                stokAwal, // stokSekarang initially same as stokAwal
                imageUrl || '', // imageUrl in column G
            ]];

            const sheetName = await this.resolveSheetName(process.env.SHEET_MASTER_BARANG);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A:G`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    async updateProduct(sku, updateData) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_MASTER_BARANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === sku);

            if (rowIndex === -1) {
                throw new Error('Product SKU not found');
            }

            const actualRowNumber = rowIndex + 2;
            const { nama, hpp, hargaJual, stokAwal, stokSekarang, imageUrl } = updateData;

            // Get current product data to fill in any missing fields
            const currentProduct = await this.getProductBySKU(sku);

            const values = [[
                sku,
                nama !== undefined ? nama : currentProduct.nama,
                hpp !== undefined ? hpp : currentProduct.hpp,
                hargaJual !== undefined ? hargaJual : currentProduct.hargaJual,
                stokAwal !== undefined ? stokAwal : currentProduct.stokAwal,
                stokSekarang !== undefined ? stokSekarang : currentProduct.stokSekarang,
                imageUrl !== undefined ? imageUrl : currentProduct.imageUrl,
            ]];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A${actualRowNumber}:G${actualRowNumber}`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(sku) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_MASTER_BARANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === sku);

            if (rowIndex === -1) {
                throw new Error('Product SKU not found');
            }

            const actualRowNumber = rowIndex + 2;

            // Delete row using batchUpdate
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: 0, // Assuming MASTER_BARANG is the first sheet
                                    dimension: 'ROWS',
                                    startIndex: actualRowNumber - 1,
                                    endIndex: actualRowNumber,
                                },
                            },
                        },
                    ],
                },
            });

            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Sales Statistics Methods
    async getSalesToday() {
        try {
            const today = new Date();
            const todayDateString = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format

            const transactions = await this.getTransactions();

            // Filter transactions for today
            const todayTransactions = transactions.filter(t => {
                const transDate = new Date(t.tanggal).toLocaleDateString('en-CA');
                return transDate === todayDateString;
            });

            const totalRevenue = todayTransactions.reduce((sum, t) => sum + t.total, 0);
            const totalProfit = todayTransactions.reduce((sum, t) => sum + t.keuntungan, 0);
            const totalItems = todayTransactions.reduce((sum, t) => sum + t.qty, 0);
            const transactionCount = todayTransactions.length;

            return {
                date: todayDateString,
                revenue: totalRevenue,
                profit: totalProfit,
                itemsSold: totalItems,
                transactionCount: transactionCount,
                transactions: todayTransactions
            };
        } catch (error) {
            console.error('Error fetching today sales:', error);
            throw error;
        }
    }

    async getWeeklySales() {
        try {
            const today = new Date();
            const transactions = await this.getTransactions();

            // Get last 7 days
            const weeklyData = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateString = date.toLocaleDateString('en-CA');

                const dayTransactions = transactions.filter(t => {
                    const transDate = new Date(t.tanggal).toLocaleDateString('en-CA');
                    return transDate === dateString;
                });

                const dayRevenue = dayTransactions.reduce((sum, t) => sum + t.total, 0);
                const dayProfit = dayTransactions.reduce((sum, t) => sum + t.keuntungan, 0);
                const dayItems = dayTransactions.reduce((sum, t) => sum + t.qty, 0);

                weeklyData.push({
                    date: dateString,
                    dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }),
                    revenue: dayRevenue,
                    profit: dayProfit,
                    itemsSold: dayItems,
                    transactionCount: dayTransactions.length
                });
            }

            const totalRevenue = weeklyData.reduce((sum, d) => sum + d.revenue, 0);
            const totalProfit = weeklyData.reduce((sum, d) => sum + d.profit, 0);
            const totalItems = weeklyData.reduce((sum, d) => sum + d.itemsSold, 0);
            const totalTransactions = weeklyData.reduce((sum, d) => sum + d.transactionCount, 0);

            return {
                period: 'Last 7 Days',
                totalRevenue,
                totalProfit,
                totalItems,
                totalTransactions,
                dailyBreakdown: weeklyData
            };
        } catch (error) {
            console.error('Error fetching weekly sales:', error);
            throw error;
        }
    }

    async getMonthlySales() {
        try {
            const today = new Date();
            const transactions = await this.getTransactions();

            // Get last 30 days grouped by weeks
            const weeklyData = [];
            for (let weekIndex = 0; weekIndex < 4; weekIndex++) {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - (30 - weekIndex * 7));

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);

                const weekTransactions = transactions.filter(t => {
                    const transDate = new Date(t.tanggal);
                    return transDate >= weekStart && transDate <= weekEnd;
                });

                const weekRevenue = weekTransactions.reduce((sum, t) => sum + t.total, 0);
                const weekProfit = weekTransactions.reduce((sum, t) => sum + t.keuntungan, 0);
                const weekItems = weekTransactions.reduce((sum, t) => sum + t.qty, 0);

                weeklyData.push({
                    weekNumber: weekIndex + 1,
                    startDate: weekStart.toLocaleDateString('en-CA'),
                    endDate: weekEnd.toLocaleDateString('en-CA'),
                    revenue: weekRevenue,
                    profit: weekProfit,
                    itemsSold: weekItems,
                    transactionCount: weekTransactions.length
                });
            }

            const totalRevenue = weeklyData.reduce((sum, w) => sum + w.revenue, 0);
            const totalProfit = weeklyData.reduce((sum, w) => sum + w.profit, 0);
            const totalItems = weeklyData.reduce((sum, w) => sum + w.itemsSold, 0);
            const totalTransactions = weeklyData.reduce((sum, w) => sum + w.transactionCount, 0);

            return {
                period: 'Last 30 Days',
                totalRevenue,
                totalProfit,
                totalItems,
                totalTransactions,
                weeklyBreakdown: weeklyData
            };
        } catch (error) {
            console.error('Error fetching monthly sales:', error);
            throw error;
        }
    }

    parseFormattedNumber(value) {
        if (!value) return 0;
        if (typeof value === 'number') return value;
        // Remove currency symbols, dots (thousands separator), and replace comma with dot (decimal separator)
        const cleanValue = value.toString()
            .replace(/Rp/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.')
            .trim();
        return parseFloat(cleanValue) || 0;
    }

    // Debt Management Methods
    async getAllDebts() {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_CATATAN_HUTANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:J`,
            });

            const rows = response.data.values || [];
            return rows.map(row => ({
                id: row[0] || '',
                namaPenghutang: row[1] || '',
                totalHutang: this.parseFormattedNumber(row[2]),
                sisaHutang: this.parseFormattedNumber(row[3]),
                cicilanPerBulan: this.parseFormattedNumber(row[4]),
                tanggalHutang: row[5] || '',
                tanggalJatuhTempo: row[6] || '',
                status: row[7] || '',
                catatan: row[8] || '',
                riwayatPembayaran: row[9] || ''
            }));
        } catch (error) {
            console.error('Error fetching debts:', error);
            throw error;
        }
    }

    async getDebtById(id) {
        try {
            const debts = await this.getAllDebts();
            return debts.find(d => d.id === id);
        } catch (error) {
            console.error('Error fetching debt by ID:', error);
            throw error;
        }
    }

    async addDebt(debtData) {
        try {
            const { namaPenghutang, totalHutang, sisaHutang, cicilanPerBulan, tanggalJatuhTempo, catatan } = debtData;

            // Generate unique ID
            const id = `DEBT-${Date.now()}`;
            const today = new Date().toLocaleDateString('en-CA');

            // Determine status
            const jatuhTempo = new Date(tanggalJatuhTempo);
            const now = new Date();
            let status = 'Aktif';
            if (sisaHutang <= 0) {
                status = 'Lunas';
            } else if (now > jatuhTempo) {
                status = 'Jatuh Tempo';
            }

            const values = [[
                id,
                namaPenghutang,
                totalHutang,
                sisaHutang,
                cicilanPerBulan,
                today,
                tanggalJatuhTempo,
                status,
                catatan || '',
                '' // riwayatPembayaran initially empty
            ]];

            const sheetName = await this.resolveSheetName(process.env.SHEET_CATATAN_HUTANG);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A:J`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            return { id, ...debtData, tanggalHutang: today, status };
        } catch (error) {
            console.error('Error adding debt:', error);
            throw error;
        }
    }

    async updateDebt(id, updateData) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_CATATAN_HUTANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === id);

            if (rowIndex === -1) {
                return null;
            }

            const actualRowNumber = rowIndex + 2;
            const currentDebt = await this.getDebtById(id);

            const { namaPenghutang, totalHutang, cicilanPerBulan, tanggalJatuhTempo, catatan } = updateData;

            // Recalculate status
            const jatuhTempo = new Date(tanggalJatuhTempo || currentDebt.tanggalJatuhTempo);
            const now = new Date();
            let status = currentDebt.status;
            if (currentDebt.sisaHutang <= 0) {
                status = 'Lunas';
            } else if (now > jatuhTempo) {
                status = 'Jatuh Tempo';
            } else {
                status = 'Aktif';
            }

            const values = [[
                id,
                namaPenghutang !== undefined ? namaPenghutang : currentDebt.namaPenghutang,
                totalHutang !== undefined ? totalHutang : currentDebt.totalHutang,
                currentDebt.sisaHutang,
                cicilanPerBulan !== undefined ? cicilanPerBulan : currentDebt.cicilanPerBulan,
                currentDebt.tanggalHutang,
                tanggalJatuhTempo !== undefined ? tanggalJatuhTempo : currentDebt.tanggalJatuhTempo,
                status,
                catatan !== undefined ? catatan : currentDebt.catatan,
                currentDebt.riwayatPembayaran
            ]];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A${actualRowNumber}:J${actualRowNumber}`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            return true;
        } catch (error) {
            console.error('Error updating debt:', error);
            throw error;
        }
    }

    async recordPayment(id, paymentAmount, paymentDate) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_CATATAN_HUTANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === id);

            if (rowIndex === -1) {
                return null;
            }

            const actualRowNumber = rowIndex + 2;
            const currentDebt = await this.getDebtById(id);

            // Calculate new remaining balance
            const newSisaHutang = Math.max(0, currentDebt.sisaHutang - paymentAmount);

            // Update payment history
            let paymentHistory = currentDebt.riwayatPembayaran;
            const paymentRecord = `${paymentDate}: Rp${paymentAmount.toLocaleString('id-ID')}`;
            paymentHistory = paymentHistory ? `${paymentHistory}; ${paymentRecord}` : paymentRecord;

            // Update status
            let status = 'Aktif';
            if (newSisaHutang <= 0) {
                status = 'Lunas';
            } else {
                const jatuhTempo = new Date(currentDebt.tanggalJatuhTempo);
                const now = new Date();
                if (now > jatuhTempo) {
                    status = 'Jatuh Tempo';
                }
            }

            const values = [[
                id,
                currentDebt.namaPenghutang,
                currentDebt.totalHutang,
                newSisaHutang,
                currentDebt.cicilanPerBulan,
                currentDebt.tanggalHutang,
                currentDebt.tanggalJatuhTempo,
                status,
                currentDebt.catatan,
                paymentHistory
            ]];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A${actualRowNumber}:J${actualRowNumber}`,
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            return { ...currentDebt, sisaHutang: newSisaHutang, status, riwayatPembayaran: paymentHistory };
        } catch (error) {
            console.error('Error recording payment:', error);
            throw error;
        }
    }

    async deleteDebt(id) {
        try {
            const sheetName = await this.resolveSheetName(process.env.SHEET_CATATAN_HUTANG);
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `'${sheetName}'!A2:A`,
            });

            const rows = response.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === id);

            if (rowIndex === -1) {
                return null;
            }

            const actualRowNumber = rowIndex + 2;

            // Get sheet metadata to find the sheet ID for CATATAN_HUTANG
            const sheetMetadata = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });

            const sheetObject = sheetMetadata.data.sheets.find(s => s.properties.title === sheetName);
            const sheetId = sheetObject ? sheetObject.properties.sheetId : 0;

            // Delete row using batchUpdate
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: 'ROWS',
                                    startIndex: actualRowNumber - 1,
                                    endIndex: actualRowNumber,
                                },
                            },
                        },
                    ],
                },
            });

            return true;
        } catch (error) {
            console.error('Error deleting debt:', error);
            throw error;
        }
    }
}

module.exports = new SheetsService();
