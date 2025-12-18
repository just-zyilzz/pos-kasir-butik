# POS System - Clothing Store

A production-ready Point of Sale (POS) system for clothing stores with Google Sheets integration for automatic accounting and inventory management.

## Tech Stack

### Backend
- Node.js + Express
- Google Sheets API (Service Account)
- PDFKit (PDF reports)
- ExcelJS (Excel reports)

### Frontend
- React.js 18
- Tailwind CSS
- Recharts (Charts)
- Axios (API client)
- Vite (Build tool)

## Features

### 1. Cashier POS
- Product selection
- Shopping cart management
- Real-time stock validation
- Payment methods: Cash / Debt (Hutang)
- Transaction confirmation

### 2. Automatic Calculations
- Profit per item
- Daily profit
- Profit for 7, 14, 21, 30 days
- Monthly profit
- Remaining stock tracking

### 3. Google Sheets Integration
Automatic sync with three sheets:

**MASTER_BARANG**
- Columns: SKU | Nama | HPP | HargaJual | StokAwal | StokSekarang
- Auto stock updates after each transaction

**TRANSAKSI_LOG**
- Columns: Tanggal | SKU | Nama | Qty | HargaJual | HPP | Total | Keuntungan
- Auto-append transaction records

**DASHBOARD_WAKTU**
- Auto-calculated profit summaries
- Today, 7/14/21/30 days, Monthly

### 4. Admin Dashboard
- Profit visualization charts (Recharts)
- Sales summary
- Inventory overview
- Low stock alerts

### 5. Report Export
- PDF sales reports with transaction details
- Excel reports with formatted data
- Custom date range filtering

## Repository Structure

```
bajuweb/
├── backend/
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── reportRoutes.js
│   ├── services/
│   │   └── sheetsService.js
│   ├── reports/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CashierPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- Google Cloud Project with Sheets API enabled
- Service Account JSON key file

### 1. Google Sheets Setup

#### Create Google Sheet
1. Create a new Google Sheet
2. Create three sheets with exact names:
   - `MASTER_BARANG`
   - `TRANSAKSI_LOG`
   - `DASHBOARD_WAKTU`

#### Setup MASTER_BARANG
Add headers in Row 1:
```
SKU | Nama | HPP | HargaJual | StokAwal | StokSekarang
```

Add sample products (Row 2+):
```
SKU001 | Kaos Polos | 50000 | 80000 | 100 | 100
SKU002 | Celana Jeans | 150000 | 250000 | 50 | 50
SKU003 | Jaket Casual | 200000 | 350000 | 30 | 30
```

#### Setup TRANSAKSI_LOG
Add headers in Row 1:
```
Tanggal | SKU | Nama | Qty | HargaJual | HPP | Total | Keuntungan
```

#### Setup DASHBOARD_WAKTU
Add headers in Row 1:
```
Period | Profit
```

Add formulas in Column B (adjust ranges as needed):
```
Row 2: Today          | =SUMIF(TRANSAKSI_LOG!A:A, TODAY(), TRANSAKSI_LOG!H:H)
Row 3: Last 7 Days    | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-7, TRANSAKSI_LOG!H:H)
Row 4: Last 14 Days   | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-14, TRANSAKSI_LOG!H:H)
Row 5: Last 21 Days   | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-21, TRANSAKSI_LOG!H:H)
Row 6: Last 30 Days   | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-30, TRANSAKSI_LOG!H:H)
Row 7: Monthly        | =SUMIF(TRANSAKSI_LOG!A:A, ">="&EOMONTH(TODAY(),-1)+1, TRANSAKSI_LOG!H:H)
```

### 2. Google Service Account Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Sheets API
4. Create Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create Service Account
   - Grant role: Editor
   - Create JSON key → Download
5. Share your Google Sheet with the service account email
   - Copy service account email (e.g., `xxx@project-id.iam.gserviceaccount.com`)
   - Open your Google Sheet
   - Click Share → Add the service account email with Editor access

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your credentials
# You need:
# - GOOGLE_SPREADSHEET_ID (from sheet URL)
# - GOOGLE_SERVICE_ACCOUNT_EMAIL (from JSON key)
# - GOOGLE_PRIVATE_KEY (from JSON key)
```

**.env file example:**
```env
PORT=5000

GOOGLE_SPREADSHEET_ID=1abc...xyz
GOOGLE_SERVICE_ACCOUNT_EMAIL=pos-service@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

SHEET_MASTER_BARANG=MASTER_BARANG
SHEET_TRANSAKSI_LOG=TRANSAKSI_LOG
SHEET_DASHBOARD_WAKTU=DASHBOARD_WAKTU
```

**Important Notes:**
- Spreadsheet ID is in the URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- Private key should include the full key with `\n` for newlines
- Keep quotes around the private key value

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if backend runs on different port
# Default: VITE_API_URL=http://localhost:5000/api
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000

## Usage

### Cashier (POS)
1. Open http://localhost:3000
2. Click on products to add to cart
3. Adjust quantities with +/- buttons
4. Select payment method (Cash/Debt)
5. Click "Confirm Transaction"
6. Transaction automatically syncs to Google Sheets

### Dashboard
1. Click "Dashboard" in navigation
2. View profit statistics and charts
3. Check inventory and low stock alerts
4. Export reports:
   - Select date range (optional)
   - Click "Export PDF" or "Export Excel"

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:sku` - Get product by SKU

### Transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions?startDate=&endDate=` - Get transactions

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/profit-chart` - Get profit chart data

### Reports
- `POST /api/reports/pdf` - Generate PDF report
- `POST /api/reports/excel` - Generate Excel report

## Production Deployment

### Backend
1. Set environment variables on your hosting platform
2. Ensure Node.js 16+ is available
3. Run: `npm install && npm start`

### Frontend
1. Build production bundle: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)
3. Set `VITE_API_URL` to your production backend URL

### Environment Variables
Make sure to set all required environment variables:
- Backend: Google credentials, port
- Frontend: API URL

## Security Notes

- Never commit `.env` files
- Keep Service Account JSON key secure
- Use HTTPS in production
- Implement authentication for dashboard access
- Add rate limiting on API endpoints

## Troubleshooting

### "Product not found" errors
- Check SKU format in Google Sheets matches exactly
- Ensure MASTER_BARANG sheet name is correct

### "Permission denied" on Google Sheets
- Verify service account email has Editor access to the sheet
- Check if Sheets API is enabled in Google Cloud Console

### Transaction fails with stock error
- Check stock values in MASTER_BARANG column F (StokSekarang)
- Ensure stock is not negative

### Reports not downloading
- Check backend logs for errors
- Ensure `reports/` directory has write permissions

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
#   p o s - k a s i r - b u t i k  
 