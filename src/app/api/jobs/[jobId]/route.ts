import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function GET(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    const job = await db.get(
      'SELECT * FROM jobs WHERE id = ?',
      [jobId]
    );

    await db.close();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user can access this job (employers can only edit their own jobs)
    if (session.user.userClass === 'Employer' && job.employerId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;
    const {
      title,
      description,
      location,
      street,
      city,
      state,
      country,
      postalCode,
      lat,
      lng,
    } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Check if job exists and belongs to the user
    const existingJob = await db.get(
      'SELECT * FROM jobs WHERE id = ? AND employerId = ?',
      [jobId, session.user.id]
    );

    if (!existingJob) {
      await db.close();
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Update the job
    await db.run(
      `UPDATE jobs SET 
        title = ?, 
        description = ?, 
        location = ?, 
        street = ?, 
        city = ?, 
        state = ?, 
        country = ?, 
        postalCode = ?, 
        lat = ?, 
        lng = ?
       WHERE id = ? AND employerId = ?`,
      [
        title,
        description,
        location,
        street,
        city,
        state,
        country,
        postalCode,
        lat,
        lng,
        jobId,
        session.user.id,
      ]
    );

    await db.close();

    return NextResponse.json({ message: 'Job updated successfully' });
  } catch (error: any) {
    console.error('Error updating job:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { jobId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = params;
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Check if job exists and belongs to the user
    const existingJob = await db.get(
      'SELECT * FROM jobs WHERE id = ? AND employerId = ?',
      [jobId, session.user.id]
    );

    if (!existingJob) {
      await db.close();
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Delete the job
    await db.run('DELETE FROM jobs WHERE id = ? AND employerId = ?', [jobId, session.user.id]);
    await db.close();

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}