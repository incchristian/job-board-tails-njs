import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  console.log("POST /api/register - Request received");

  let body;
  try {
    body = await req.json();
    console.log("POST /api/register - Body:", body);
  } catch (error) {
    console.error("POST /api/register - Error parsing body:", error);
    return new NextResponse(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, password, userClass, company } = body;

  if (!name || !email || !password) {
    console.log("POST /api/register - Missing required fields:", { name, email, password });
    return new NextResponse(JSON.stringify({ error: "Name, email, and password are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    console.log("POST /api/register - Database opened");

    const existingUser = await db.get("SELECT email FROM users WHERE email = ?", [email]);
    if (existingUser) {
      console.log("POST /api/register - User already exists:", email);
      await db.close();
      return new NextResponse(JSON.stringify({ error: "User with this email already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("POST /api/register - Password hashed for:", email);

    await db.run(
      "INSERT INTO users (name, email, password, userClass, company) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, userClass || "Candidate", userClass === "Employer" ? company : null]
    );
    console.log("POST /api/register - User inserted:", email);

    await db.close();
    return new NextResponse(JSON.stringify({ message: "User registered successfully" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST /api/register - Server error:", error);
    return new NextResponse(JSON.stringify({ error: "Server error: " + error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}