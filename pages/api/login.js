import { NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./database.sqlite");

const postHandler = async (request) => {
  if (request.method !== "POST") {
    return NextResponse.json(
      { error: `Method ${request.method} Not Allowed` },
      { status: 405, headers: { Allow: "POST" } }
    );
  }

  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Please fill in all fields." },
      { status: 400 }
    );
  }

  return new Promise((resolve) => {
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          resolve(
            NextResponse.json(
              { error: "Failed to retrieve user." },
              { status: 500 }
            )
          );
        } else if (!user) {
          resolve(
            NextResponse.json(
              { error: "Invalid email or password." },
              { status: 401 }
            )
          );
        } else {
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            resolve(
              NextResponse.json(
                { error: "Invalid email or password." },
                { status: 401 }
              )
            );
          } else {
            resolve(
              NextResponse.json({ message: "Login successful." }, { status: 200 })
            );
          }
        }
      }
    );
  });
};

export { postHandler as POST };