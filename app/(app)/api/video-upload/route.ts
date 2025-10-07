import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}


export async function POST(request: NextRequest) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json({ error: "Cloudinary credentials not found" }, { status: 500 });
  }


  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const originalSize = formData.get("originalsize") as string | null;


    if (!file || !title || !description || !originalSize) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    // Convert Blob to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);


    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "video-uploader",
          transformation: [
            { quality: "auto", fetch_format: "mp4" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer);
    });


    // Remove 'utility' if not in your schema!
    const video = await prisma.video.create({
      data: {
        title,
        description,
        publicId: result.public_id,
        compressedSize: String(result.bytes),
        originalSize,
        duration: result.duration || 0,
        userId,
      }
    });


    return NextResponse.json(video, { status: 201 });


  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 