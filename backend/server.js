require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const salesRoutes = require('./routes/salesRoutes');
const debtRoutes = require('./routes/debtRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Note: No static file serving needed - images are now on Google Drive

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to POS API. Backend is running.');
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'POS API Base Endpoint',
    endpoints: [
      '/api/products',
      '/api/transactions',
      '/api/reports',
      '/api/dashboard',
      '/api/sales',
      '/api/debts',
      '/api/health'
    ]
  });
});

// Environment variable check endpoint
app.get('/api/test-env', (req, res) => {
  const envCheck = {
    GOOGLE_SPREADSHEET_ID: !!process.env.GOOGLE_SPREADSHEET_ID,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
    SHEET_MASTER_BARANG: !!process.env.SHEET_MASTER_BARANG,
    SHEET_TRANSAKSI_LOG: !!process.env.SHEET_TRANSAKSI_LOG,
    SHEET_DASHBOARD_WAKTU: !!process.env.SHEET_DASHBOARD_WAKTU,
    SHEET_CATATAN_HUTANG: !!process.env.SHEET_CATATAN_HUTANG,
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
  };

  const allSet = Object.values(envCheck).every(v => v === true);

  res.json({
    success: allSet,
    message: allSet ? 'All environment variables are set' : 'Some environment variables are missing',
    variables: envCheck
  });
});

app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/debts', debtRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'POS Backend is running on Vercel' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Export for Vercel serverless
module.exports = app;
