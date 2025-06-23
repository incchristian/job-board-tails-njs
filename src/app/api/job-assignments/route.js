import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Employer assigns job to recruiter
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, recruiterId, message } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Check if job belongs to this employer
    const job = await db.get(
      'SELECT * FROM jobs WHERE id = ? AND employerId = ?',
      [jobId, session.user.id]
    );

    if (!job) {
      await db.close();
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if recruiter exists
    const recruiter = await db.get(
      'SELECT * FROM users WHERE id = ? AND userClass = "recruiter"',
      [recruiterId]
    );

    if (!recruiter) {
      await db.close();
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 });
    }

    // Check if assignment already exists
    const existingAssignment = await db.get(
      'SELECT * FROM job_assignments WHERE jobId = ? AND recruiterId = ?',
      [jobId, recruiterId]
    );

    if (existingAssignment) {
      await db.close();
      return NextResponse.json({ error: 'Job already assigned to this recruiter' }, { status: 400 });
    }

    // Create assignment
    const result = await db.run(
      'INSERT INTO job_assignments (jobId, employerId, recruiterId, message) VALUES (?, ?, ?, ?)',
      [jobId, session.user.id, recruiterId, message || '']
    );

    // Create notification for recruiter
    await db.run(
      'INSERT INTO notifications (userId, type, title, message, relatedId) VALUES (?, ?, ?, ?, ?)',
      [
        recruiterId,
        'job_assignment',
        'New Job Assignment',
        `You have been assigned to find candidates for: ${job.title}`,
        result.lastID
      ]
    );

    await db.close();

    return NextResponse.json({ success: true, assignmentId: result.lastID });
  } catch (error) {
    console.error('Error creating job assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get job assignments
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    let assignments;

    if (session.user.userClass === 'employer') {
      if (jobId) {
        assignments = await db.all(`
          SELECT 
            ja.*,
            u.name as recruiterName,
            u.email as recruiterEmail,
            u.profilePicture as recruiterProfilePicture,
            j.title as jobTitle
          FROM job_assignments ja
          JOIN users u ON u.id = ja.recruiterId
          JOIN jobs j ON j.id = ja.jobId
          WHERE ja.employerId = ? AND ja.jobId = ?
          ORDER BY ja.createdAt DESC
        `, [session.user.id, jobId]);
      } else {
        assignments = await db.all(`
          SELECT 
            ja.*,
            u.name as recruiterName,
            u.email as recruiterEmail,
            u.profilePicture as recruiterProfilePicture,
            j.title as jobTitle
          FROM job_assignments ja
          JOIN users u ON u.id = ja.recruiterId
          JOIN jobs j ON j.id = ja.jobId
          WHERE ja.employerId = ?
          ORDER BY ja.createdAt DESC
        `, [session.user.id]);
      }
    } else if (session.user.userClass === 'recruiter') {
      assignments = await db.all(`
        SELECT 
          ja.*,
          u.name as employerName,
          u.email as employerEmail,
          u.company as employerCompany,
          j.title as jobTitle,
          j.description as jobDescription,
          j.location as jobLocation,
          j.salary as jobSalary,
          j.requirements as jobRequirements
        FROM job_assignments ja
        JOIN users u ON u.id = ja.employerId
        JOIN jobs j ON j.id = ja.jobId
        WHERE ja.recruiterId = ?
        ORDER BY ja.createdAt DESC
      `, [session.user.id]);
    }

    await db.close();

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching job assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Recruiter accepts/declines assignment
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId, status } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Update assignment status
    await db.run(
      'UPDATE job_assignments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND recruiterId = ?',
      [status, assignmentId, session.user.id]
    );

    // Get assignment details for notification
    const assignment = await db.get(`
      SELECT ja.*, j.title as jobTitle, u.name as recruiterName
      FROM job_assignments ja
      JOIN jobs j ON j.id = ja.jobId
      JOIN users u ON u.id = ja.recruiterId
      WHERE ja.id = ?
    `, [assignmentId]);

    // Create notification for employer
    const notificationMessage = status === 'accepted' 
      ? `${assignment.recruiterName} accepted the job assignment for: ${assignment.jobTitle}`
      : `${assignment.recruiterName} declined the job assignment for: ${assignment.jobTitle}`;

    await db.run(
      'INSERT INTO notifications (userId, type, title, message, relatedId) VALUES (?, ?, ?, ?, ?)',
      [
        assignment.employerId,
        'assignment_response',
        `Job Assignment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        notificationMessage,
        assignmentId
      ]
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating job assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}