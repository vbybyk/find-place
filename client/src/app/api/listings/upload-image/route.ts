"use server";

import { type NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const uploadImage = async (file: any, path: string) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ public_id: `${path}/${Date.now()}` }, (error, result) => {
      if (error) reject(error);
      else resolve(result?.url);
    });

    stream.write(file);
    stream.end();
  });
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return new Response("File not found", { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const data = await uploadImage(buffer, "listings");
  return new Response(data, { status: 200 });
}
