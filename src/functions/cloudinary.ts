import cloudinary from "cloudinary";

// Configure Cloudinary with  account credentials
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload an image to Cloudinary
export const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath);
    console.log("Image uploaded successfully:");
    console.log(result.url);
    return result.url;
  } catch (error) {
    console.error("Error uploading image:");
    console.error(error);
  }
};

// Fetch an image from Cloudinary
export const fetchImage = async (publicId) => {
  try {
    const result = await cloudinary.v2.api.resource(publicId);
    console.log("Image fetched successfully:");
    console.log(result);
  } catch (error) {
    console.error("Error fetching image:");
    console.error(error);
  }
};

// Perform a POST request with an image uploaded to Cloudinary
export const postImage = async (filePath, payload) => {
  try {
    const uploadResult = await cloudinary.v2.uploader.upload(filePath);
    const imageUrl = uploadResult.secure_url;

    console.log("Image URL:", imageUrl);
    console.log("Payload:", payload);
  } catch (error) {
    console.error("Error uploading image:");
    console.error(error);
  }
};
