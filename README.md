<div align="center">

# 🛍️ POS System - Clothing Store

### Modern Point of Sale System with Google Sheets Integration

[![Made with React](https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Sheets](https://img.shields.io/badge/Google%20Sheets-API-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)](https://developers.google.com/sheets)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Modern • Fast • Real-time Sync • Production Ready**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 🎯 Overview

A **production-ready** Point of Sale system designed for clothing stores with automatic inventory management, profit tracking, and real-time Google Sheets synchronization. Perfect for small to medium-sized retail businesses!

### ✨ Why This POS?

- 🚀 **Real-time Sync** - Every transaction instantly updates Google Sheets
- 💰 **Automatic Calculations** - Profit tracking, inventory management, all automated
- 📊 **Beautiful Dashboard** - Modern dark theme with interactive charts
- 💳 **Debt Management** - Track customer debts and payment installments
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Built with Tailwind CSS for a premium look

---

## 🚀 Features

### 💵 Cashier POS
- 🛒 **Smart Product Selection** with real-time stock validation
- 🧮 **Automatic Calculations** for total, profit per item
- 💰 **Multiple Payment Methods**: Cash or Debt (Hutang)
- ⚡ **Instant Sync** to Google Sheets after transaction
- 🎯 **Low Stock Alerts** to prevent overselling

### 💳 Debt Management **(NEW!)**
- 📝 **Complete Debt Records** with customer tracking
- 💵 **Payment Installments** with auto-calculated balances
- 📊 **Status Tracking**: Active / Paid / Overdue
- 🔍 **Search & Filter** by debtor name and status
- 📈 **Statistics Dashboard** for active debts overview
- 💾 **Payment History** tracking for each debt

### 📦 Product Management
- ➕ **Add/Edit Products** with SKU management
- 🖼️ **Product Images** upload and display
- 📊 **Real-time Stock** updates after each sale
- 🔍 **Search Products** by name or SKU
- ⚠️ **Stock Alerts** for low inventory

### 📊 Analytics Dashboard
- 📈 **Profit Charts** with Recharts visualization
- 💰 **Revenue Tracking**: Today, 7/14/21/30 days, Monthly
- 📉 **Sales Statistics** with daily/weekly/monthly breakdown
- 🎯 **Inventory Overview** with low stock alerts
- 📑 **Export Reports** in PDF and Excel formats

### 🔗 Google Sheets Integration

Seamless synchronization with **4 Google Sheets**:

| Sheet | Purpose | Auto-Updated |
|-------|---------|--------------|
| 📦 **MASTER_BARANG** | Product inventory & pricing | ✅ After each sale |
| 📝 **TRANSAKSI_LOG** | Transaction records | ✅ Real-time logging |
| 📊 **DASHBOARD_WAKTU** | Profit calculations | ✅ Auto-calculated |
| 💳 **CATATAN_HUTANG** | Debt management | ✅ Payment tracking |

---

## 🎨 Demo

### 🖥️ Screenshots

> *Coming soon! Add screenshots of your POS system here*

### 🎥 Live Demo

> *Deploy your app to Vercel and add the link here*

---

## 🛠️ Tech Stack

### Backend
- ⚡ **Node.js** + Express.js
- 📊 **Google Sheets API** for data storage
- 📄 **PDFKit** for PDF report generation
- 📗 **ExcelJS** for Excel exports
- 🔐 **Service Account** authentication

### Frontend
- ⚛️ **React 18** with Hooks
- 🎨 **Tailwind CSS** for styling
- 📊 **Recharts** for data visualization
- 🌐 **Axios** for API calls
- ⚡ **Vite** for blazing fast builds

---

## ⚡ Quick Start

### Prerequisites

- Node.js 16+ installed
- Google Cloud account with Sheets API enabled
- Service Account JSON key

### 1️⃣ Clone Repository

```bash
git clone https://github.com/just-zyilzz/pos-kasir-butik.git
cd pos-kasir-butik
```

### 2️⃣ Setup Google Sheets

Create a new Google Spreadsheet with **4 sheets**:

<details>
<summary>📦 <b>MASTER_BARANG</b> - Product Inventory</summary>

**Headers (Row 1):**
```
SKU | Nama | HPP | HargaJual | StokAwal | StokSekarang | ImageUrl
```

**Sample Data:**
```
SKU001 | Kaos Polos      | 50000  | 80000  | 100 | 100 | /uploads/...
SKU002 | Celana Jeans    | 150000 | 250000 | 50  | 50  | /uploads/...
SKU003 | Jaket Casual    | 200000 | 350000 | 30  | 30  | /uploads/...
```
</details>

<details>
<summary>📝 <b>TRANSAKSI_LOG</b> - Transaction Records</summary>

**Headers (Row 1):**
```
Tanggal | SKU | Nama | Qty | HargaJual | HPP | Total | Keuntungan
```

*Transactions are automatically logged here*
</details>

<details>
<summary>📊 <b>DASHBOARD_WAKTU</b> - Profit Analytics</summary>

**Headers (Row 1):**
```
Period | Profit
```

**Setup with Formulas:**
```
Row 2: Today        | =SUMIF(TRANSAKSI_LOG!A:A, TODAY(), TRANSAKSI_LOG!H:H)
Row 3: Last 7 Days  | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-7, TRANSAKSI_LOG!H:H)
Row 4: Last 14 Days | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-14, TRANSAKSI_LOG!H:H)
Row 5: Last 21 Days | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-21, TRANSAKSI_LOG!H:H)
Row 6: Last 30 Days | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-30, TRANSAKSI_LOG!H:H)
Row 7: Monthly      | =SUMIF(TRANSAKSI_LOG!A:A, ">="&EOMONTH(TODAY(),-1)+1, TRANSAKSI_LOG!H:H)
```
</details>

<details>
<summary>💳 <b>CATATAN_HUTANG</b> - Debt Management</summary>

**Headers (Row 1):**
```
ID | Nama Penghutang | Total Hutang | Sisa Hutang | Cicilan Per Bulan | Tanggal Hutang | Tanggal Jatuh Tempo | Status | Catatan | Riwayat Pembayaran
```

*Debt records are automatically synced here*
</details>

### 3️⃣ Setup Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/Select project → Enable **Google Sheets API**
3. Create **Service Account** → Download JSON key
4. Share your Google Sheet with service account email (Editor access)

### 4️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start
```

**`.env` Configuration:**
```env
PORT=5000

GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SHEET_MASTER_BARANG=MASTER_BARANG
SHEET_TRANSAKSI_LOG=TRANSAKSI_LOG
SHEET_DASHBOARD_WAKTU=DASHBOARD_WAKTU
SHEET_CATATAN_HUTANG=CATATAN_HUTANG
```

> **💡 Tip:** Get Spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 5️⃣ Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if needed
npm run dev
```

**`.env` Configuration:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 6️⃣ Access the App

- **Frontend:** http://localhost:5173 (or 3000)
- **Backend:** http://localhost:5000

---

## 📖 Documentation

### 🔌 API Endpoints

<details>
<summary><b>Product Endpoints</b></summary>

```bash
GET    /api/products              # Get all products
GET    /api/products/:sku         # Get product by SKU
POST   /api/products              # Add new product
PUT    /api/products/:sku         # Update product
DELETE /api/products/:sku         # Delete product
POST   /api/products/:sku/image   # Upload product image
```
</details>

<details>
<summary><b>Transaction Endpoints</b></summary>

```bash
GET    /api/transactions          # Get all transactions
POST   /api/transactions          # Create transaction
GET    /api/sales/today           # Today's sales
GET    /api/sales/weekly          # Weekly breakdown
GET    /api/sales/monthly         # Monthly breakdown
```
</details>

<details>
<summary><b>Debt Endpoints</b></summary>

```bash
GET    /api/debts                 # Get all debts
GET    /api/debts/:id             # Get debt by ID
POST   /api/debts                 # Add new debt
PUT    /api/debts/:id             # Update debt
POST   /api/debts/:id/payment     # Record payment
DELETE /api/debts/:id             # Delete debt
```
</details>

<details>
<summary><b>Report Endpoints</b></summary>

```bash
POST   /api/reports/pdf           # Generate PDF
POST   /api/reports/excel         # Generate Excel
GET    /api/dashboard/stats       # Dashboard statistics
```
</details>

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

**Backend:**
- Deploy to Vercel, Railway, or Render
- Set environment variables in dashboard
- Update `VITE_API_URL` in frontend to production URL

### Environment Variables Checklist

**Backend:**
- ✅ `GOOGLE_SPREADSHEET_ID`
- ✅ `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- ✅ `GOOGLE_PRIVATE_KEY`
- ✅ `SHEET_MASTER_BARANG`
- ✅ `SHEET_TRANSAKSI_LOG`
- ✅ `SHEET_DASHBOARD_WAKTU`
- ✅ `SHEET_CATATAN_HUTANG`

**Frontend:**
- ✅ `VITE_API_URL`

---

## 🎯 Usage Guide

### 💰 Making a Sale

1. Navigate to **Cashier** page
2. Click on products to add to cart
3. Adjust quantities with **+/-** buttons
4. Select payment method (Cash/Debt)
5. Click **Confirm Transaction**
6. ✅ Transaction auto-syncs to Google Sheets!

### 💳 Managing Debts

1. Navigate to **Debts** page
2. Click **Add Debt** to record new customer debt
3. Fill in debtor details and payment terms
4. Click **Pay** to record installment payments
5. Track payment history and status updates

### 📊 Viewing Analytics

1. Navigate to **Dashboard** page
2. View profit charts and statistics
3. Check inventory levels
4. Export reports in PDF/Excel format

---

## 🛡️ Security Notes

- 🔒 Never commit `.env` files
- 🔑 Keep Service Account JSON secure
- 🌐 Use HTTPS in production
- 🔐 Implement authentication for production
- ⚡ Add rate limiting on API endpoints

---

## 🐛 Troubleshooting

<details>
<summary><b>❌ "Product not found" errors</b></summary>

- Verify SKU format matches exactly in Google Sheets
- Check if `MASTER_BARANG` sheet name is correct
- Ensure column order matches the expected format
</details>

<details>
<summary><b>❌ "Permission denied" on Google Sheets</b></summary>

- Verify service account has **Editor** access
- Check if Sheets API is enabled in Google Cloud
- Confirm spreadsheet ID is correct
</details>

<details>
<summary><b>❌ Stock validation errors</b></summary>

- Check stock values in `MASTER_BARANG` column F
- Ensure stock is not negative
- Verify data types (numbers not text)
</details>

---

## 📝 License

MIT License - feel free to use this project for your business!

---

## 💖 Support

If this project helped your business, consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or issues
- 💡 Suggesting new features
- 📢 Sharing with other store owners

---

<div align="center">

**Built with ❤️ for small business owners**

Made by [just-zyilzz](https://github.com/just-zyilzz)

[⬆ Back to Top](#️-pos-system---clothing-store)

</div>