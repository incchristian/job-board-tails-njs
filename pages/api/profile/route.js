// src/app/api/profile/route.js
import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Import authOptions

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) console.error("Error connecting to SQLite:", err);
  else console.log("Connected to SQLite");
});

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("Session received:", session);

  if (!session) {
    console.log("No session found, rejecting request");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  console.log("User info:", { userId, userEmail });

  return new Promise((resolve) => {
    db.get(
      "SELECT * FROM candidates WHERE user_id = ? AND email = ?",
      [userId, userEmail],
      (err, row) => {
        if (err) {
          console.error("Error retrieving profile data:", err);
          resolve(
            NextResponse.json(
              { error: "Failed to retrieve profile data" },
              { status: 500 }
            )
          );
        } else {
          const profile = row || { name: "", phone: "", address: "", bio: "" };
          console.log("Fetched profile data:", profile);
          resolve(NextResponse.json(profile));
        }
      }
    );
  });
}

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  console.log("Session received:", session);

  if (!session) {
    console.log("No session found, rejecting request");
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const { name, phone, address, bio } = await request.json();
  console.log("Received PUT request with data:", { name, phone, address, bio });

  if (!name || !phone || !address || !bio) {
    console.log("Missing required fields");
    return NextResponse.json(
      { error: "All fields (name, phone, address, bio) are required" },
      { status: 400 }
    );
  }

  return new Promise((resolve) => {
    db.run(
      "UPDATE candidates SET name = ?, phone = ?, address = ?, bio = ? WHERE user_id = ? AND email = ?",
      [name, phone, address, bio, userId, userEmail],
      function (err) {
        if (err) {
          console.error("Error updating profile:", err);
          resolve(
            NextResponse.json(
              { error: "Failed to update profile" },
              { status: 500 }
            )
          );
        } else if (this.changes === 0) {
          console.log("No rows updated, inserting new profile");
          db.run(
            "INSERT INTO candidates (user_id, email, name, phone, address, bio) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, userEmail, name, phone, address, bio],
            (err) => {
              if (err) {
                console.error("Error creating profile:", err);
                resolve(
                  NextResponse.json(
                    { error: "Failed to create profile" },
                    { status: 500 }
                  )
                );
              } else {
                console.log("Profile created:", { name, phone, address, bio });
                resolve(
                  NextResponse.json(
                    {
                      message: "Profile created",
                      data: { name, phone, address, bio },
                    },
                    { status: 201 }
                  )
                );
              }
            }
          );
        } else {
          console.log("Profile updated:", { name, phone, address, bio });
          resolve(
            NextResponse.json({
              message: "Profile updated",
              data: { name, phone, address, bio },
            })
          );
        }
      }
    );
  });
}

// Create candidates table
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS candidates (
      user_id TEXT,
      email TEXT,
      name TEXT,
      phone TEXT,
      address TEXT,
      bio TEXT,
      PRIMARY KEY (user_id, email)
    )`,
    (err) => {
      if (err) console.error("Error creating table:", err);
      else console.log("Candidates table ready");
    }
  );
});