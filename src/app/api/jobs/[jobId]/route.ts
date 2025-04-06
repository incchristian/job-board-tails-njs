import { NextRequest, NextResponse } from "next/server";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function PUT(req: NextRequest, { params }) {
  try {
    const { jobId } = params;
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

    console.log("Received PUT request for jobId:", jobId, "with data:", {
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

    if (!jobId || !title || !description || !location) {
      return NextResponse.json({ message: "Missing required fields or jobId" }, { status: 400 });
    }

    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    const result = await db.run(
      `UPDATE jobs 
       SET title = ?, description = ?, location = ?, employerId = ?, logoPath = ?, lat = ?, lng = ?, country = ?, state = ?, street = ?, city = ?, postalCode = ? 
       WHERE id = ?`,
      [
        title,
        description,
        location,
        employerId || null,
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

    if (result.changes === 0) {
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
    return NextResponse.json({ message: "Missing jobId" }, { status: 400 });
  }
  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    const result = await db.run("DELETE FROM jobs WHERE id = ?", [jobId]);
    console.log("Delete result:", result);
    await db.close();
    if (result.changes === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Job deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}