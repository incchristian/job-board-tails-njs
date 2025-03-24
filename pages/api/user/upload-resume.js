import { promises as fs } from "fs";
import path from "path";
import formidable from "formidable";
import { getSession } from "next-auth/react";

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads/resumes");
  await fs.mkdir(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    filter: ({ mimetype }) =>
      mimetype === "application/pdf" ||
      mimetype === "application/msword" ||
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  try {
    const [fields, files] = await form.parse(req);
    const file = files.resume?.[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const newFileName = `${session.user.id}-${Date.now()}-${file.originalFilename}`;
    const newPath = path.join(uploadDir, newFileName);
    await fs.rename(file.filepath, newPath);

    return res.status(200).json({
      message: "Resume uploaded successfully",
      filePath: `/uploads/resumes/${newFileName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Failed to upload resume" });
  }
};