/**
 * WhatsApp sharing utilities
 */

const PHONE_NUMBER = '6283872749541'; // Indonesian format without +

/**
 * Generate WhatsApp wa.me link with message
 * @param {string} message - Message to send
 * @param {string} phone - Phone number (optional, defaults to configured number)
 * @returns {string} WhatsApp link
 */
export const generateWhatsAppLink = (message, phone = PHONE_NUMBER) => {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
};

/**
 * Format transaction data to WhatsApp message
 * @param {object} transactionData - Transaction details
 * @returns {string} Formatted message
 */
export const formatTransactionMessage = (transactionData) => {
    const { date, items, total, paymentMethod, itemCount } = transactionData;

    const message = `🛍️ *Transaksi Baru - POS System*

📅 Tanggal: ${date}
📦 Jumlah Item: ${itemCount} produk
💰 Total: Rp ${total.toLocaleString('id-ID')}
💳 Pembayaran: ${paymentMethod === 'cash' ? 'Cash' : 'Hutang'}

Detail Produk:
${items.map((item, idx) => `${idx + 1}. ${item.nama} x${item.qty} = Rp ${(item.hargaJual * item.qty).toLocaleString('id-ID')}`).join('\n')}

Terima kasih! 🙏`;

    return message;
};

/**
 * Format sales report data to WhatsApp message
 * @param {object} reportData - Sales report data
 * @returns {string} Formatted message
 */
export const formatSalesReportMessage = (reportData) => {
    const { period, totalRevenue, totalProfit, totalTransactions } = reportData;

    const message = `📊 *Laporan Penjualan - POS System*

📅 Periode: ${period}
💰 Total Penjualan: Rp ${totalRevenue.toLocaleString('id-ID')}
✨ Total Profit: Rp ${totalProfit.toLocaleString('id-ID')}
📝 Jumlah Transaksi: ${totalTransactions}

Generated from POS System Dashboard`;

    return message;
};

/**
 * Open WhatsApp with pre-filled message
 * @param {string} message - Message to send
 * @param {string} phone - Phone number (optional)
 */
export const shareToWhatsApp = (message, phone = PHONE_NUMBER) => {
    const link = generateWhatsAppLink(message, phone);
    window.open(link, '_blank');
};

/**
 * Share transaction to WhatsApp
 * @param {object} transactionData - Transaction details
 */
export const shareTransactionToWhatsApp = (transactionData) => {
    const message = formatTransactionMessage(transactionData);
    shareToWhatsApp(message);
};

/**
 * Share sales report to WhatsApp
 * @param {object} reportData - Report data
 */
export const shareSalesReportToWhatsApp = (reportData) => {
    const message = formatSalesReportMessage(reportData);
    shareToWhatsApp(message);
};
