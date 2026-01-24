import { v2 as cloudinary } from "cloudinary";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (imageFile: File): Promise<string> => {
  try {
    let dataUri: string | null = null;

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");
    const mimeType = imageFile.type;

    if (!mimeType.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    dataUri = `data:${mimeType};base64,${base64String}`;

    // Ensure correct format for Cloudinary
    if (!dataUri.startsWith("data:image/")) {
      throw new Error("Invalid Data URI format");
    }

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "nextjs_uploads",
      //transformation: [{ width: 500, height: 500, crop: "fill" }],
    });
    console.log(result);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Image upload failed");
  }
};

export const uploadVideo = async (videoFile: File): Promise<string> => {
  try {
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString("base64");
    const mimeType = videoFile.type;

    if (!mimeType.startsWith("video/")) {
      throw new Error("Invalid file type. Only videos are allowed.");
    }

    const dataUri = `data:${mimeType};base64,${base64String}`;

    // Upload to Cloudinary as a video
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: "video",
      folder: "nextjs_uploads/videos",
      // Optional: specify transformations or format
      // transformation: [{ width: 1280, height: 720, crop: "limit" }],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary video upload error:", error);
    throw new Error("Video upload failed");
  }
};
