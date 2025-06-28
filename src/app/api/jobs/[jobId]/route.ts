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
    console.log(`🔍 Session user ID: "${session.user.id}" (type: ${typeof session.user.id})`);

    if (action !== 'hire-recruiter') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Convert everything to integers for consistency
    const jobIdInt = parseInt(jobId);
    const employerIdInt = parseInt(session.user.id);
    const recruiterIdInt = parseInt(recruiterId);
    
    console.log(`🔍 Looking for job ${jobIdInt} with employerId ${employerIdInt}`);
    
    // Check if job exists and belongs to this employer
    const job = await db.get(
      'SELECT * FROM jobs WHERE id = ? AND employerId = ?',
      [jobIdInt, employerIdInt]
    );

    if (!job) {
      console.log(`❌ Job ${jobIdInt} not found for employer ${employerIdInt}`);
      // Debug: Show what jobs exist
      const allJobs = await db.all('SELECT id, title, employerId FROM jobs LIMIT 5');
      console.log(`📋 Sample jobs in database:`, allJobs);
      await db.close();
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    console.log(`✅ Job found: "${job.title}" (ID: ${job.id}, employerId: ${job.employerId})`);

    // Check if recruiter exists
    const recruiter = await db.get(
      'SELECT id, name, userClass FROM users WHERE id = ? AND userClass = ?',
      [recruiterIdInt, 'Recruiter']
    );

    if (!recruiter) {
      console.log(`❌ Recruiter ${recruiterIdInt} not found`);
      await db.close();
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    console.log(`✅ Recruiter found: "${recruiter.name}" (ID: ${recruiter.id})`);

    // Check if recruiter is already hired for this job
    const existingHire = await db.get(
      'SELECT * FROM job_recruiters WHERE jobId = ? AND recruiterId = ?',
      [jobIdInt, recruiterIdInt]
    );

    if (existingHire) {
      console.log(`❌ Recruiter already hired with status: ${existingHire.status}`);
      await db.close();
      return NextResponse.json({ 
        error: `Recruiter already hired for this job (Status: ${existingHire.status})` 
      }, { status: 400 });
    }

    console.log(`✅ No existing hire found. Proceeding with hiring...`);

    // Create job_recruiters entry with PENDING status
    const hireResult = await db.run(
      'INSERT INTO job_recruiters (jobId, recruiterId, employerId, status, hiredAt) VALUES (?, ?, ?, ?, ?)',
      [jobIdInt, recruiterIdInt, employerIdInt, 'pending', new Date().toISOString()]
    );

    console.log(`✅ Created job_recruiters entry with ID: ${hireResult.lastID}`);

    // Create notification for the recruiter
    const notificationResult = await db.run(
      `INSERT INTO notifications (userId, type, title, message, relatedId, isRead, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        recruiterIdInt,
        'job_hired',
        'New Job Assignment!',
        `You have been hired by ${session.user.name} for: ${job.title}`,
        jobIdInt,
        false,
        new Date().toISOString()
      ]
    );

    console.log(`✅ Created notification with ID: ${notificationResult.lastID}`);

    // Update job status (only if jobs table has status column)
    try {
      await db.run(
        'UPDATE jobs SET status = ? WHERE id = ?',
        ['recruiter_hired', jobIdInt]
      );
      console.log(`✅ Updated job status to 'recruiter_hired'`);
    } catch (statusError) {
      console.log(`⚠️ Could not update job status (column might not exist):`, statusError.message);
    }

    await db.close();

    return NextResponse.json({ 
      message: 'Recruiter hired successfully! They will receive a notification.',
      jobId: jobIdInt,
      recruiterId: recruiterIdInt,
      status: 'pending',
      hireId: hireResult.lastID,
      notificationId: notificationResult.lastID
    });

  } catch (error: any) {
    console.error("❌ Error hiring recruiter:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message,
      code: error.code
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