// src/pages/api/register.js
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./database.sqlite");

// Create users table if it doesn’t exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      userClass TEXT NOT NULL,
      company TEXT
    )
  `);

  // Ensure candidates table exists (matches profile API)
  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      user_id TEXT,
      email TEXT,
      name TEXT,
      phone TEXT,
      address TEXT,
      bio TEXT,
      PRIMARY KEY (user_id, email)
    )
  `);
});

export default async (req, res) => {
  if (req.method === "POST") {
    const { name, email, password, userClass, company } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !userClass ||
      (userClass === "Employer" && !company)
    ) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert into users table
      db.run(
        `INSERT INTO users (name, email, password, userClass, company) VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, userClass, company],
        function (err) {
          if (err) {
            console.error("Error inserting into users:", err);
            return res
              .status(500)
              .json({ error: "Failed to register user." });
          }

          const userId = this.lastID.toString(); // Get the auto-incremented ID as a string
          console.log("User registered with ID:", userId);

          // Insert default profile into candidates table
          db.run(
            `INSERT INTO candidates (user_id, email, name, phone, address, bio) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, email, name, "", "", ""], // Default empty phone, address, bio
            (err) => {
              if (err) {
                console.error("Error inserting into candidates:", err);
                // Don’t fail the registration if candidates insert fails, just log it
                res.status(201).json({
                  message:
                    "User registered successfully, but profile initialization failed.",
                });
              } else {
                console.log("Profile initialized for user:", {
                  user_id: userId,
                  email,
                  name,
                });
                res
                  .status(201)
                  .json({ message: "User registered successfully." });
              }
            }
          );
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to register user." });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};