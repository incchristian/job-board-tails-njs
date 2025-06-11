import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/authOptions";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { recipientId, content } = await request.json();
  if (!recipientId || !content) {
    return NextResponse.json({ error: "Missing recipientId or content" }, { status: 400 });
  }

  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  const result = await db.run(
    "INSERT INTO messages (senderId, recipientId, content, timestamp) VALUES (?, ?, ?, ?)",
    [session.user.id, recipientId, content, new Date().toISOString()]
  );

  await db.close();

  return NextResponse.json({ id: result.lastID });
}