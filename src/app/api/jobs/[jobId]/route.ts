import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== "Employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await params;
    const { recruiterId, action } = await request.json();
    
    console.log(`🔍 Hiring request: Job ${jobId}, Recruiter ${recruiterId}, Action: ${action}`);

    if (action !== 'hire-recruiter') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    const jobIdInt = parseInt(jobId);
    const employerIdInt = parseInt(session.user.id);
    const recruiterIdInt = parseInt(recruiterId);
    
    // Check if job exists and belongs to this employer
    const job = await db.get(
      'SELECT * FROM jobs WHERE id = ? AND employerId = ?',
      [jobIdInt, employerIdInt]
    );

    if (!job) {
      await db.close();
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    // Check if recruiter exists
    const recruiter = await db.get(
      'SELECT id, name, userClass FROM users WHERE id = ? AND (userClass = ? OR userClass = ?)',
      [recruiterIdInt, 'Recruiter', 'recruiter']
    );

    if (!recruiter) {
      await db.close();
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await db.get(
      'SELECT * FROM job_assignments WHERE jobId = ? AND recruiterId = ? AND employerId = ?',
      [jobIdInt, recruiterIdInt, employerIdInt]
    );

    if (existingAssignment) {
      await db.close();
      return NextResponse.json({ 
        error: `Recruiter already assigned to this job (Status: ${existingAssignment.status})` 
      }, { status: 400 });
    }

    // 🎯 CREATE UNIFIED ASSIGNMENT ENTRY
    const assignmentResult = await db.run(
      `INSERT INTO job_assignments (
        jobId, 
        employerId, 
        recruiterId, 
        message, 
        status, 
        createdAt, 
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        jobIdInt, 
        employerIdInt, 
        recruiterIdInt, 
        `Hired for: ${job.title}`, 
        'accepted', // ✅ CHANGED FROM 'hired' TO 'accepted'
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    console.log(`✅ Created shared assignment with ID: ${assignmentResult.lastID}`);

    // Also create job_recruiters entry for backward compatibility
    const hireResult = await db.run(
      'INSERT INTO job_recruiters (jobId, recruiterId, employerId, status, hiredAt) VALUES (?, ?, ?, ?, ?)',
      [jobIdInt, recruiterIdInt, employerIdInt, 'hired', new Date().toISOString()]
    );

    // Create notification for the recruiter
    await db.run(
      `INSERT INTO notifications (userId, type, title, message, relatedId, isRead, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        recruiterIdInt,
        'job_assignment',
        'New Job Assignment!',
        `You have been hired by ${session.user.name} for: ${job.title}`,
        assignmentResult.lastID, // Reference the assignment, not the job
        false,
        new Date().toISOString()
      ]
    );

    // Update job status
    await db.run(
      'UPDATE jobs SET status = ? WHERE id = ?',
      ['recruiter_hired', jobIdInt]
    );

    await db.close();

    return NextResponse.json({ 
      message: 'Recruiter hired successfully! Assignment created and visible to both parties.',
      assignmentId: assignmentResult.lastID,
      jobId: jobIdInt,
      recruiterId: recruiterIdInt,
      status: 'hired'
    });

  } catch (error: any) {
    console.error("❌ Error hiring recruiter:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Get job with all fields including location data
    const job = await db.get(`
      SELECT j.*, u.name as companyName, u.email as companyEmail
      FROM jobs j 
      JOIN users u ON j.employerId = u.id 
      WHERE j.id = ?
    `, [jobId]);

    await db.close();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Remove access restriction - allow all logged-in users to view jobs
    // Only restrict editing/deleting to job owners
    
    return NextResponse.json({ job });
  } catch (error: any) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;
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

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await params;
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