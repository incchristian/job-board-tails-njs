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