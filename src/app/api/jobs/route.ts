import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(req: NextRequest) {
  const employerId = req.nextUrl.searchParams.get("employerId");

  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });

    if (employerId) {
      const jobs = await db.all(
        "SELECT id, title, description, location, employerId, logoPath, lat, lng, country, state, street, city, postalCode FROM jobs WHERE employerId = ?",
        [employerId]
      );
      await db.close();
      return NextResponse.json(jobs, { status: 200 });
    } else {
      const jobs = await db.all(
        "SELECT id, title, description, location, employerId, logoPath, lat, lng, country, state, street, city, postalCode FROM jobs"
      );
      console.log("All jobs fetched:", jobs);
      await db.close();
      return NextResponse.json(jobs, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      description,
      location,
      employerId,
      logoPath,
      lat,
      lng,
      country,
      state,
      street,
      city,
      postalCode,
    } = await req.json();
    console.log("Received job data:", {
      title,
      description,
      location,
      employerId,
      logoPath,
      lat,
      lng,
      country,
      state,
      street,
      city,
      postalCode,
    });

    if (!title || !description || !location || !employerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    await db.run(
      "INSERT INTO jobs (title, description, location, employerId, logoPath, lat, lng, country, state, street, city, postalCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        description,
        location,
        employerId,
        logoPath || null,
        lat || null,
        lng || null,
        country || null,
        state || null,
        street || null,
        city || null,
        postalCode || null,
      ]
    );
    await db.close();
    return NextResponse.json({ message: "Job posted successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Error posting job:", error.message);
    return NextResponse.json({ message: "Server error", details: error.message }, { status: 500 });
  }
}