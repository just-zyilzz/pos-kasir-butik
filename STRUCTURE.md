# FULL PRODUCTION-READY REPOSITORY STRUCTURE

```
bajuweb/
│
├── backend/
│   ├── routes/
│   │   ├── productRoutes.js          # Product API endpoints
│   │   ├── transactionRoutes.js      # Transaction processing with stock validation
│   │   ├── dashboardRoutes.js        # Dashboard statistics & charts
│   │   └── reportRoutes.js           # PDF & Excel report generation
│   │
│   ├── services/
│   │   └── sheetsService.js          # Google Sheets API operations
│   │
│   ├── reports/                      # Generated reports (auto-created)
│   │
│   ├── server.js                     # Express server entry point
│   ├── package.json                  # Backend dependencies
│   ├── .env.example                  # Environment variables template
│   └── .gitignore                    # Backend gitignore
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CashierPage.jsx       # POS interface
│   │   │   └── DashboardPage.jsx     # Admin dashboard with charts
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Axios API client
│   │   │
│   │   ├── App.jsx                   # Main app with routing
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind CSS
│   │
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── postcss.config.js             # PostCSS config
│   ├── .env.example                  # Frontend env template
│   └── .gitignore                    # Frontend gitignore
│
├── README.md                         # Complete documentation
└── .gitignore                        # Root gitignore
```

# GOOGLE SHEETS STRUCTURE

## Sheet 1: MASTER_BARANG
```
Row 1 (Headers): SKU | Nama | HPP | HargaJual | StokAwal | StokSekarang

Row 2+: Sample products
SKU001 | Kaos Polos | 50000 | 80000 | 100 | 100
SKU002 | Celana Jeans | 150000 | 250000 | 50 | 50
SKU003 | Jaket Casual | 200000 | 350000 | 30 | 30
```

## Sheet 2: TRANSAKSI_LOG
```
Row 1 (Headers): Tanggal | SKU | Nama | Qty | HargaJual | HPP | Total | Keuntungan

Row 2+: Auto-populated by backend after each transaction
```

## Sheet 3: DASHBOARD_WAKTU
```
Row 1 (Headers): Period | Profit

Row 2: Today          | =SUMIF(TRANSAKSI_LOG!A:A, TODAY(), TRANSAKSI_LOG!H:H)
Row 3: Last 7 Days    | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-7, TRANSAKSI_LOG!H:H)
Row 4: Last 14 Days   | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-14, TRANSAKSI_LOG!H:H)
Row 5: Last 21 Days   | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-21, TRANSAKSI_LOG!H:H)
Row 6: Last 30 Days   | =SUMIF(TRANSAKSI_LOG!A:A, ">="&TODAY()-30, TRANSAKSI_LOG!H:H)
Row 7: Monthly        | =SUMIF(TRANSAKSI_LOG!A:A, ">="&EOMONTH(TODAY(),-1)+1, TRANSAKSI_LOG!H:H)
```

# SETUP & RUN INSTRUCTIONS

## 1. GOOGLE CLOUD SETUP

### Create Service Account:
```
1. Visit: https://console.cloud.google.com/
2. Create new project
3. Enable Google Sheets API
4. Go to: IAM & Admin → Service Accounts → Create Service Account
5. Download JSON key file
6. Copy service account email (e.g., pos-service@project-id.iam.gserviceaccount.com)
```

### Share Google Sheet:
```
1. Create new Google Sheet
2. Create 3 sheets: MASTER_BARANG, TRANSAKSI_LOG, DASHBOARD_WAKTU
3. Click Share → Add service account email with Editor access
4. Copy Spreadsheet ID from URL
```

## 2. BACKEND SETUP

```bash
cd backend
npm install
cp .env.example .env
```

### Edit .env file:
```env
PORT=5000

GOOGLE_SPREADSHEET_ID=1abc...xyz
GOOGLE_SERVICE_ACCOUNT_EMAIL=pos-service@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

SHEET_MASTER_BARANG=MASTER_BARANG
SHEET_TRANSAKSI_LOG=TRANSAKSI_LOG
SHEET_DASHBOARD_WAKTU=DASHBOARD_WAKTU
```

### Start backend:
```bash
npm start
# or development mode:
npm run dev
```

## 3. FRONTEND SETUP

```bash
cd frontend
npm install
cp .env.example .env
```

### Edit .env file:
```env
VITE_API_URL=http://localhost:5000/api
```

### Start frontend:
```bash
npm run dev
```

## 4. ACCESS APPLICATION

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API Health: http://localhost:5000/api/health

# PRODUCTION DEPLOYMENT

## Backend (Heroku/Railway/Render):
```bash
# Set environment variables on platform
# Deploy backend code
npm install
npm start
```

## Frontend (Vercel/Netlify):
```bash
npm run build
# Deploy dist/ folder
# Set VITE_API_URL to production backend URL
```

# API DOCUMENTATION

## Products
```
GET    /api/products           # Get all products
GET    /api/products/:sku      # Get product by SKU
```

## Transactions
```
POST   /api/transactions       # Create transaction
GET    /api/transactions       # Get all transactions
```

Request body:
```json
{
  "items": [
    { "sku": "SKU001", "qty": 2 }
  ],
  "paymentMethod": "cash"
}
```

## Dashboard
```
GET    /api/dashboard/stats         # Get statistics
GET    /api/dashboard/profit-chart  # Get chart data
```

## Reports
```
POST   /api/reports/pdf       # Generate PDF
POST   /api/reports/excel     # Generate Excel
```

Request body:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

# FEATURES SUMMARY

✅ Cashier POS with real-time stock validation
✅ Automatic profit calculations (daily, 7/14/21/30 days, monthly)
✅ Google Sheets auto-sync (WRITE access)
✅ Stock management with low stock alerts
✅ Payment methods: Cash & Debt
✅ Admin dashboard with Recharts visualization
✅ PDF & Excel report export
✅ Production-ready code
✅ Clean architecture
✅ REST API
✅ No negative stock allowed
✅ Full error handling

# READY TO:
- [x] Run locally
- [x] Deploy to production
- [x] Push to GitHub
