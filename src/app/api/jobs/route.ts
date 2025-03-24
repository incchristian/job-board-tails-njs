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
        "SELECT id, title, description, location, logoPath, lat, lng FROM jobs WHERE employerId = ?",
        [employerId]
      );
      await db.close();
      return NextResponse.json(jobs, { status: 200 });
    } else {
      const jobs = await db.all(
        "SELECT id, title, description, location, logoPath, lat, lng FROM jobs"
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
    const { title, description, location, employerId, logoPath } = await req.json();
    if (!title || !description || !location || !employerId) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyA8Kd0-RN8DRm0l5hxelpsSiHY9eZz-0V0`
    );
    const geocodeData = await geocodeResponse.json();
    const { lat, lng } = geocodeData.results[0]?.geometry.location || {};

    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    await db.run(
      "INSERT INTO jobs (title, description, location, employerId, logoPath, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, description, location, employerId, logoPath || null, lat || null, lng || null]
    );
    await db.close();
    return NextResponse.json({ message: "Job posted successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error posting job:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { title, description, location } = await req.json();
    const jobId = req.nextUrl.pathname.split("/").pop();

    if (!jobId || !title || !description || !location) {
      return NextResponse.json({ message: "Missing required fields or jobId" }, { status: 400 });
    }

    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=AIzaSyA8Kd0-RN8DRm0l5hxelpsSiHY9eZz-0V0`
    );
    const geocodeData = await geocodeResponse.json();
    const { lat, lng } = geocodeData.results[0]?.geometry.location || {};

    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    const result = await db.run(
      "UPDATE jobs SET title = ?, description = ?, location = ?, lat = ?, lng = ? WHERE id = ?",
      [title, description, location, lat || null, lng || null, jobId]
    );
    await db.close();

    if (result.changes === 0) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Job updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const jobId = req.nextUrl.pathname.split("/").pop();
  if (!jobId) {
    return NextResponse.json({ message: "Missing jobId" }, { status: 400 });
  }
  try {
    const db = await open({
      filename: "./database.sqlite",
      driver: sqlite3.Database,
    });
    const result = await db.run("DELETE FROM jobs WHERE id = ?", [jobId]);
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