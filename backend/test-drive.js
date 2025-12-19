const { google } = require('googleapis');
require('dotenv').config();

async function testDrive() {
    const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive']
    );

    const drive = google.drive({ version: 'v3', auth });
    const folderId = '1xTy2E36VBudTDL_JL4Q59XF7vv2UtcER';

    console.log(`Checking folder ID: ${folderId}`);
    try {
        const response = await drive.files.get({
            fileId: folderId,
            fields: 'id, name, permissions'
        });

        console.log('✅ Folder found!');
        console.log('Folder Name:', response.data.name);

        // Check permissions
        const perms = await drive.permissions.list({
            fileId: folderId
        });
        console.log('\nPermissions:');
        perms.data.permissions.forEach(p => {
            console.log(`- ${p.emailAddress || 'Anyone'} (${p.role})`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('File not found')) {
            console.log('\nTIP: Make sure you have shared the folder with the service account email:');
            console.log(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
        }
    }
}

testDrive();
