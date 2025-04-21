import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path to your auth config

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await open({
    filename: "C:/Projects/job-board-tails-njs/database.sqlite",
    driver: sqlite3.Database,
  });

  // Fetch messages where the user is the recipient
  const messages = await db.all(
    `SELECT m.id, m.content, m.timestamp, u.name AS senderName, u.profilePicture AS senderPic
     FROM messages m
     JOIN users u ON m.senderId = u.id
     WHERE m.recipientId = ?
     ORDER BY m.timestamp DESC
     LIMIT 5`,
    [session.user.id]
  );

  await db.close();

  return NextResponse.json({ messages });
}