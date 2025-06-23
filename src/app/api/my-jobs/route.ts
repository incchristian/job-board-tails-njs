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

    const jobs = await db.all(
      'SELECT * FROM jobs WHERE employerId = ? ORDER BY createdAt DESC',
      [session.user.id]
    );

    await db.close();

    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error('Error fetching user jobs:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}