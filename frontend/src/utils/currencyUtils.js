/**
 * Currency formatting utilities for Rupiah
 */

/**
 * Format number to Rupiah string with thousand separators (dots)
 * Example: 1500000 -> "1.500.000"
 */
export const formatRupiah = (value) => {
    if (!value) return '';

    // Remove non-digit characters
    const numStr = value.toString().replace(/\D/g, '');

    // Add thousand separators (dots)
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse Rupiah formatted string back to number
 * Example: "1.500.000" -> 1500000
 */
export const parseRupiah = (formatted) => {
    if (!formatted) return 0;

    // Remove dots and convert to number
    const numStr = formatted.toString().replace(/\./g, '');
    return parseInt(numStr) || 0;
};

/**
 * Handle input change with Rupiah formatting
 * Use in onChange handler
 */
export const handleCurrencyInput = (value, setValue) => {
    const formatted = formatRupiah(value);
    setValue(formatted);
    return formatted;
};

/**
 * Format number to display Rupiah with "Rp" prefix
 * Example: 1500000 -> "Rp 1.500.000"
 */
export const formatRupiahDisplay = (value) => {
    if (!value && value !== 0) return 'Rp 0';
    return `Rp ${formatRupiah(value)}`;
};
