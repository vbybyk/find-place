import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

/** Stream a buffer to Cloudinary; returns the https `secure_url`. */
export const uploadBufferToCloudinary = (buffer: Buffer, folder: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ public_id: `${folder}/${Date.now()}` }, (error, result) => {
      if (error) reject(error);
      else resolve(result?.secure_url ?? "");
    });
    stream.write(buffer);
    stream.end();
  });
