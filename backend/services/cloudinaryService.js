const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class CloudinaryService {
    /**
     * Upload an image buffer to Cloudinary
     * @param {Buffer} buffer - The image buffer
     * @param {string} folder - The folder to upload to (optional)
     * @returns {Promise<string>} - The secure URL of the uploaded image
     */
    async uploadImage(buffer, folder = 'pos-products') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );

            uploadStream.end(buffer);
        });
    }

    /**
     * Delete an image from Cloudinary (optional feature)
     * @param {string} publicId - The public ID of the image
     */
    async deleteImage(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
            return true;
        } catch (error) {
            console.error('Cloudinary delete error:', error);
            return false;
        }
    }
}

module.exports = new CloudinaryService();
