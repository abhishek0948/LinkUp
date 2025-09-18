const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = (file) => {
  const options = {
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
  };

  return new Promise((resolve, reject) => {
    const uploader = file.mimetype.startsWith("video")
      ? cloudinary.uploader.upload_large
      : cloudinary.uploader.upload;
    
    uploader(file.path, options, (error, result) => {
      fs.unlink(file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting temp file:", unlinkErr);
      });
      
      if (error) {
        console.error("Cloudinary upload error:", error);
        return reject(error);
      }
      resolve(result);
    });
  });
};

const multermiddleware = multer({ dest: uploadDir }).single('media');

module.exports = {
    multermiddleware,
    uploadFileToCloudinary
}
