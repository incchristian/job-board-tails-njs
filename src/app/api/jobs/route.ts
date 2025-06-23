import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employerId = searchParams.get('employerId');
    
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    let query = `
      SELECT j.*, u.name as employerName 
      FROM jobs j 
      LEFT JOIN users u ON j.employerId = u.id
    `;
    let params: any[] = [];

    if (employerId) {
      query += ' WHERE j.employerId = ?';
      params.push(employerId);
    }

    query += ' ORDER BY j.createdAt DESC';

    const jobs = await db.all(query, params);
    await db.close();

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      postalCode 
    } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    const result = await db.run(
      `INSERT INTO jobs (title, description, location, employerId, logoPath, lat, lng, country, state, street, city, postalCode, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
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

    return NextResponse.json({ 
      success: true, 
      jobId: result.lastID,
      message: 'Job posted successfully'
    });
  } catch (error: any) {
    console.error('Error creating job:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}