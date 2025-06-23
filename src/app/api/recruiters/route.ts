import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Get all users with userClass = 'Recruiter'
    const recruiters = await db.all(
      `SELECT id, name, email, userClass, createdAt 
       FROM users 
       WHERE userClass = 'Recruiter' 
       ORDER BY name ASC`
    );

    await db.close();

    // Add some mock data for better presentation
    const recruitersWithDetails = recruiters.map(recruiter => ({
      ...recruiter,
      specialization: "Technology & IT", // Mock data
      experience: Math.floor(Math.random() * 10) + 2, // Mock 2-12 years
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock 3.5-5.0 rating
    }));

    return NextResponse.json(recruitersWithDetails);
  } catch (error: any) {
    console.error('Error fetching recruiters:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

