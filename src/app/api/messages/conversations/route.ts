import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  const conversations = await db.all(
    `SELECT DISTINCT u.id AS senderId, u.name AS senderName, u.profilePicture AS senderPic, 
            (SELECT content FROM messages m2 WHERE (m2.senderId = u.id AND m2.recipientId = ?) OR (m2.senderId = ? AND m2.recipientId = u.id) ORDER BY m2.timestamp DESC LIMIT 1) AS lastMessage
     FROM users u
     JOIN messages m ON (m.senderId = u.id AND m.recipientId = ?) OR (m.senderId = ? AND m.recipientId = u.id)
     WHERE u.id != ?
     ORDER BY (SELECT MAX(timestamp) FROM messages m3 WHERE (m3.senderId = u.id AND m3.recipientId = ?) OR (m3.senderId = ? AND m3.recipientId = u.id)) DESC`,
    [
      session.user.id,
      session.user.id,
      session.user.id,
      session.user.id,
      session.user.id,
      session.user.id,
      session.user.id,
    ]
  );

  await db.close();

  return NextResponse.json({ conversations });
}