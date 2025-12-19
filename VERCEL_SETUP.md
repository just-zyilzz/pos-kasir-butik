# VERCEL DEPLOYMENT SETUP GUIDE

## CRITICAL: Environment Variables MUST be Set in Vercel

**Backend Vercel Project**: `backend-pos-kasir-butik-iyam`

### Steps to Configure:

1. Go to https://vercel.com/dashboard
2. Click on your backend project
3. Go to **Settings** → **Environment Variables**
4. Add ALL variables below
5. Click **Save**
6. Go to **Deployments** → Click latest → **Redeploy**

### Required Variables (Copy from your local .env file):

```bash
# Google Sheets API - CRITICAL
GOOGLE_SPREADSHEET_ID=your_actual_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Sheet Names
SHEET_MASTER_BARANG=MASTER_BARANG
SHEET_TRANSAKSI_LOG=TRANSAKSI_LOG
SHEET_DASHBOARD_WAKTU=DASHBOARD_WAKTU
SHEET_CATATAN_HUTANG=CATATAN_HUTANG

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional
NODE_ENV=production
PORT=5000
```

## Frontend Vercel Project: `pos-kasir-butik-iyam`

### Frontend Environment Variable:

```bash
VITE_API_URL=https://backend-pos-kasir-butik-iyam.vercel.app/api
```

## Testing After Deployment:

1. **Test Backend Health**: https://backend-pos-kasir-butik-iyam.vercel.app/api/health
2. **Test Env Check**: https://backend-pos-kasir-butik-iyam.vercel.app/api/test-env
3. **Test Products**: https://backend-pos-kasir-butik-iyam.vercel.app/api/products
4. **Test Frontend**: https://pos-kasir-butik-iyam.vercel.app

## Common Issues:

### Issue: "Cannot GET /api"
- **Solution**: Backend deployed successfully, this is expected for base /api path

### Issue: 500 Error on /api/products
- **Solution**: Environment variables missing in Vercel. Follow steps above.

### Issue: Frontend can't fetch products
- **Solution**: Check VITE_API_URL is set correctly in frontend Vercel settings

## IMPORTANT NOTES:

1. **GOOGLE_PRIVATE_KEY**: Must keep `\n` as literal string `\n`, not actual newlines
2. **Vercel Auto-Deploy**: Pushing to GitHub triggers auto-deployment
3. **Environment Variables**: Must be set MANUALLY in Vercel dashboard for EACH project
4. **Separate Projects**: Backend and frontend are separate Vercel projects
