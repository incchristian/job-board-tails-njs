import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { existsSync } from "fs";

export async function PUT(req: NextRequest, { params }) {
  try {
    const { jobId } = params;
    const {
      title,
      description,
      location,
      logoPath,
      lat,
      lng,
      country,
      state,
      street,
      city,
      postalCode,
    } = await req.json();

    console.log("Received PUT request for jobId:", jobId, "with data:", {
      title,
      description,
      location,
      logoPath,
      lat,
      lng,
      country,
      state,
      street,
      city,
      postalCode,
    });

    if (!jobId || !title || !description || !location) {
      console.log("Validation failed: Missing required fields");
      return NextResponse.json({ message: "Missing required fields or jobId" }, { status: 400 });
    }

    const dbPath = "C:/Projects/job-board-tails-njs/database.sqlite";
    console.log("Checking database path:", dbPath, "Exists:", existsSync(dbPath));
    if (!existsSync(dbPath)) {
      throw new Error("Database file not found at specified path");
    }

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Database opened successfully");

    const result = await db.run(
      `UPDATE jobs 
       SET title = ?, description = ?, location = ?, logoPath = ?, lat = ?, lng = ?, country = ?, state = ?, street = ?, city = ?, postalCode = ? 
       WHERE id = ?`,
      [
        title,
        description,
        location,
        logoPath || null,
        lat || null,
        lng || null,
        country || null,
        state || null,
        street || null,
        city || null,
        postalCode || null,
        jobId,
      ]
    );
    console.log("Update result:", result);

    await db.close();
    console.log("Database closed");

    if (result.changes === 0) {
      console.log("No rows updated, job not found for id:", jobId);
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating job:", error.message, "Stack:", error.stack);
    return NextResponse.json({ message: "Server error", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }) {
  const { jobId } = params;
  if (!jobId) {
    console.log("Validation failed: Missing jobId");
    return NextResponse.json({ message: "Missing jobId" }, { status: 400 });
  }
  try {
    const dbPath = "C:/Projects/job-board-tails-njs/database.sqlite";
    console.log("Checking database path for DELETE:", dbPath, "Exists:", existsSync(dbPath));
    if (!existsSync(dbPath)) {
      throw new Error("Database file not found at specified path");
    }

    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Database opened successfully for DELETE");

    const result = await db.run("DELETE FROM jobs WHERE id = ?", [jobId]);
    console.log("Delete result:", result);

    await db.close();
    console.log("Database closed for DELETE");

    if (result.changes === 0) {
      console.log("No rows deleted, job not found for id:", jobId);
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Job deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting job:", error.message, "Stack:", error.stack);
    return NextResponse.json({ message: "Server error", details: error.message }, { status: 500 });
  }
}