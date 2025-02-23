import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getToken } from "next-auth/jwt";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  console.log("POST /api/user/upload - Request received");

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("POST /api/user/upload - NEXTAUTH_SECRET not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const token = await getToken({
    req,
    secret,
    cookieName: "next-auth.session-token",
    secureCookie: false,
  });
  console.log("POST /api/user/upload - Token:", token);

  if (!token || !token.sub) {
    console.log("POST /api/user/upload - Unauthorized, no token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.sub;
  console.log("POST /api/user/upload - User ID:", userId);

  try {
    // Configure Cloudinary (ensure these are set in your .env file)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const formData = await req.formData();
    const file = formData.get("profile") as File | null;
    console.log("POST /api/user/upload - File received:", file?.name, "Size:", file?.size);

    if (!file) {
      console.log("POST /api/user/upload - No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to a buffer for Cloudinary upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `user-${userId}-${Date.now()}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { public_id: fileName, folder: "user_profiles" }, // Customize folder and public_id as needed
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    console.log("POST /api/user/upload - Cloudinary upload result:", uploadResult);

    const imageUrl = (uploadResult as any).secure_url; // Type assertion for simplicity

    // Update database with Cloudinary URL
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    const result = await db.run(
      "UPDATE users SET profilePicture = ? WHERE id = ?",
      [imageUrl, userId]
    );
    console.log("POST /api/user/upload - Database update result:", result.changes, "URL:", imageUrl);

    // Verify the update
    const updatedUser = await db.get("SELECT profilePicture FROM users WHERE id = ?", [userId]);
    console.log("POST /api/user/upload - Verified profilePicture:", updatedUser.profilePicture);
    await db.close();

    if (result.changes === 0) {
      console.error("POST /api/user/upload - No rows updated, user ID might not exist");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile picture updated",
      path: imageUrl,
    }, { status: 200 });
  } catch (error) {
    console.error("POST /api/user/upload - Error:", error);
    return NextResponse.json({
      error: "Server error",
      details: error.message,
    }, { status: 500 });
  }
}