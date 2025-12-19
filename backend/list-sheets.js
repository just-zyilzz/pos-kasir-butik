const { google } = require('googleapis');
require('dotenv').config();

async function inspectSheets() {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    try {
        console.log('--- MASTER_BARANG ---');
        const masterRes = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "'MASTER_BARANG'!A1:H10",
        });
        console.log('Headers:', masterRes.data.values[0]);
        console.log('Rows:', masterRes.data.values.slice(1, 4));

        console.log('\n--- CATATAN_HUTANG  (With space) ---');
        try {
            const debtRes = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: "'CATATAN_HUTANG '!A1:J10",
            });
            console.log('Found with space!');
            console.log('Headers:', debtRes.data.values[0]);
        } catch (e) {
            console.log('Failed with space:', e.message);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

inspectSheets();
