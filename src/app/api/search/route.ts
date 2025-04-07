import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const db = await open({
    filename: "C:/Projects/job-board-tails-njs/database.sqlite",
    driver: sqlite3.Database,
  });

  const searchTerm = `%${query.toLowerCase()}%`;

  // Fetch jobs by title
  const jobs = await db.all(
    "SELECT id, title FROM jobs WHERE LOWER(title) LIKE ? LIMIT 5",
    [searchTerm]
  );

  // Fetch users by name or userClass
  const users = await db.all(
    "SELECT id, name, userClass FROM users WHERE LOWER(name) LIKE ? OR LOWER(userClass) LIKE ? LIMIT 5",
    [searchTerm, searchTerm]
  );

  await db.close();

  return NextResponse.json({ jobs, users });
}