const express = require('express');
const router = express.Router();
const sheetsService = require('../services/sheetsService');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');

// Get all products (with optional search)
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let products = await sheetsService.getAllProducts();

        // Filter by search query if provided
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p =>
                p.nama.toLowerCase().includes(searchLower) ||
                p.sku.toLowerCase().includes(searchLower)
            );
        }

        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get product by SKU
router.get('/:sku', async (req, res) => {
    try {
        const product = await sheetsService.getProductBySKU(req.params.sku);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new product
router.post('/', async (req, res) => {
    try {
        const { sku, nama, hpp, hargaJual, stokAwal } = req.body;

        if (!sku || !nama || !hpp || !hargaJual || stokAwal === undefined) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        await sheetsService.addProduct(req.body);
        res.json({ success: true, message: 'Product added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update product
router.put('/:sku', async (req, res) => {
    try {
        await sheetsService.updateProduct(req.params.sku, req.body);
        res.json({ success: true, message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Upload product image
router.post('/:sku/image', upload.single('image'), async (req, res) => {
    try {
        const cloudinaryService = require('../services/cloudinaryService');

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file provided' });
        }

        // Get product info to use product name in filename
        const product = await sheetsService.getProductBySKU(req.params.sku);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Upload to Cloudinary
        const imageUrl = await cloudinaryService.uploadImage(req.file.buffer);

        // Update product with image URL in Google Sheets
        await sheetsService.updateProduct(req.params.sku, { imageUrl });

        res.json({
            success: true,
            message: 'Image uploaded successfully to Cloudinary',
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete product
router.delete('/:sku', async (req, res) => {
    try {
        await sheetsService.deleteProduct(req.params.sku);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
