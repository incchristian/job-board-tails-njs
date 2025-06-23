import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Recruiter submits candidate for job
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, candidateId, recruiterNotes } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Check if recruiter is assigned to this job
    const assignment = await db.get(
      'SELECT * FROM job_assignments WHERE jobId = ? AND recruiterId = ? AND status = "accepted"',
      [jobId, session.user.id]
    );

    if (!assignment) {
      await db.close();
      return NextResponse.json({ error: 'You are not assigned to this job' }, { status: 403 });
    }

    // Check if candidate exists
    const candidate = await db.get(
      'SELECT * FROM users WHERE id = ? AND userClass = "candidate"',
      [candidateId]
    );

    if (!candidate) {
      await db.close();
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check if candidate already submitted for this job
    const existingSubmission = await db.get(
      'SELECT * FROM candidate_submissions WHERE jobId = ? AND candidateId = ?',
      [jobId, candidateId]
    );

    if (existingSubmission) {
      await db.close();
      return NextResponse.json({ error: 'Candidate already submitted for this job' }, { status: 400 });
    }

    // Create submission
    const result = await db.run(
      'INSERT INTO candidate_submissions (jobId, candidateId, recruiterId, employerId, recruiterNotes) VALUES (?, ?, ?, ?, ?)',
      [jobId, candidateId, session.user.id, assignment.employerId, recruiterNotes || '']
    );

    // Get job details for notification
    const job = await db.get('SELECT title FROM jobs WHERE id = ?', [jobId]);

    // Create notification for employer
    await db.run(
      'INSERT INTO notifications (userId, type, title, message, relatedId) VALUES (?, ?, ?, ?, ?)',
      [
        assignment.employerId,
        'candidate_submission',
        'New Candidate Submitted',
        `A recruiter submitted ${candidate.name} for: ${job.title}`,
        result.lastID
      ]
    );

    // Create notification for candidate
    await db.run(
      'INSERT INTO notifications (userId, type, title, message, relatedId) VALUES (?, ?, ?, ?, ?)',
      [
        candidateId,
        'job_application',
        'You have been submitted for a job',
        `A recruiter submitted your profile for: ${job.title}`,
        result.lastID
      ]
    );

    await db.close();

    return NextResponse.json({ success: true, submissionId: result.lastID });
  } catch (error) {
    console.error('Error submitting candidate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get candidate submissions
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

    let submissions;

    if (session.user.userClass === 'employer') {
      if (jobId) {
        submissions = await db.all(`
          SELECT 
            cs.*,
            c.name as candidateName,
            c.email as candidateEmail,
            c.profilePicture as candidateProfilePicture,
            c.bio as candidateBio,
            c.skills as candidateSkills,
            c.experience as candidateExperience,
            r.name as recruiterName,
            j.title as jobTitle
          FROM candidate_submissions cs
          JOIN users c ON c.id = cs.candidateId
          JOIN users r ON r.id = cs.recruiterId
          JOIN jobs j ON j.id = cs.jobId
          WHERE cs.employerId = ? AND cs.jobId = ?
          ORDER BY cs.submittedAt DESC
        `, [session.user.id, jobId]);
      } else {
        submissions = await db.all(`
          SELECT 
            cs.*,
            c.name as candidateName,
            c.email as candidateEmail,
            c.profilePicture as candidateProfilePicture,
            r.name as recruiterName,
            j.title as jobTitle
          FROM candidate_submissions cs
          JOIN users c ON c.id = cs.candidateId
          JOIN users r ON r.id = cs.recruiterId
          JOIN jobs j ON j.id = cs.jobId
          WHERE cs.employerId = ?
          ORDER BY cs.submittedAt DESC
        `, [session.user.id]);
      }
    } else if (session.user.userClass === 'recruiter') {
      if (jobId) {
        submissions = await db.all(`
          SELECT 
            cs.*,
            c.name as candidateName,
            c.email as candidateEmail,
            c.profilePicture as candidateProfilePicture,
            j.title as jobTitle
          FROM candidate_submissions cs
          JOIN users c ON c.id = cs.candidateId
          JOIN jobs j ON j.id = cs.jobId
          WHERE cs.recruiterId = ? AND cs.jobId = ?
          ORDER BY cs.submittedAt DESC
        `, [session.user.id, jobId]);
      } else {
        submissions = await db.all(`
          SELECT 
            cs.*,
            c.name as candidateName,
            c.email as candidateEmail,
            c.profilePicture as candidateProfilePicture,
            j.title as jobTitle
          FROM candidate_submissions cs
          JOIN users c ON c.id = cs.candidateId
          JOIN jobs j ON j.id = cs.jobId
          WHERE cs.recruiterId = ?
          ORDER BY cs.submittedAt DESC
        `, [session.user.id]);
      }
    } else if (session.user.userClass === 'candidate') {
      submissions = await db.all(`
        SELECT 
          cs.*,
          r.name as recruiterName,
          j.title as jobTitle,
          j.description as jobDescription,
          j.company as jobCompany,
          j.location as jobLocation,
          j.salary as jobSalary
        FROM candidate_submissions cs
        JOIN users r ON r.id = cs.recruiterId
        JOIN jobs j ON j.id = cs.jobId
        WHERE cs.candidateId = ?
        ORDER BY cs.submittedAt DESC
      `, [session.user.id]);
    }

    await db.close();

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}