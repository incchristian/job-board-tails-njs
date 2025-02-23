import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  console.log("GET /api/user/update - Headers:", Object.fromEntries(req.headers));
  let session = await getServerSession(authOptions);
  console.log("GET /api/user/update - Session from getServerSession:", session);

  // Fallback to getToken if getServerSession fails
  if (!session || !session.user?.id) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token" // Explicitly specify cookie name
    });
    console.log("GET /api/user/update - Token from getToken:", token);

    if (token && token.sub) {
      session = { user: { id: token.sub, name: token.name, email: token.email } };
      console.log("GET /api/user/update - Session set from token:", session);
    } else {
      return NextResponse.json({ 
        error: "Unauthorized - No valid session or token", 
        session, 
        token, 
        cookies: req.cookies.get("next-auth.session-token") 
      }, { status: 401 });
    }
  }

  if (!session || !session.user?.id) {
    return NextResponse.json({ 
      error: "Unauthorized - Final check failed", 
      session 
    }, { status: 401 });
  }

  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    const user = await db.get(
      "SELECT name, email, phoneNumber, username, bio FROM users WHERE id = ?",
      [session.user.id]
    );
    await db.close();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/update - Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log("POST /api/user/update - Headers:", Object.fromEntries(req.headers));
  let session = await getServerSession(authOptions);
  console.log("POST /api/user/update - Session from getServerSession:", session);

  if (!session || !session.user?.id) {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token" 
    });
    console.log("POST /api/user/update - Token from getToken:", token);

    if (token && token.sub) {
      session = { user: { id: token.sub, name: token.name, email: token.email } };
      console.log("POST /api/user/update - Session set from token:", session);
    } else {
      return NextResponse.json({ 
        error: "Unauthorized - No valid session or token", 
        session, 
        token, 
        cookies: req.cookies.get("next-auth.session-token") 
      }, { status: 401 });
    }
  }

  if (!session || !session.user?.id) {
    return NextResponse.json({ 
      error: "Unauthorized - Final check failed", 
      session 
    }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
    console.log("POST /api/user/update - Request body:", body);
  } catch (error) {
    console.error("POST /api/user/update - Invalid body:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, email, phoneNumber, username, bio } = body;
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    await db.run(
      "UPDATE users SET name = ?, email = ?, phoneNumber = ?, username = ?, bio = ? WHERE id = ?",
      [name, email, phoneNumber || null, username || null, bio || null, session.user.id]
    );
    console.log("POST /api/user/update - User updated, ID:", session.user.id);

    await db.close();
    return NextResponse.json({ message: "Profile updated" }, { status: 200 });
  } catch (error) {
    console.error("POST /api/user/update - Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}