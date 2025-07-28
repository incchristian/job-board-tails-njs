import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function POST() {
  try {
    console.log('🧪 Starting test data creation...');
    
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // First, let's see what we have
    const allUsers = await db.all('SELECT id, name, userClass FROM users');
    console.log('👥 All users:', allUsers);

    const allJobs = await db.all('SELECT id, title, employerId FROM jobs');
    console.log('💼 All jobs:', allJobs);

    const allAssignments = await db.all('SELECT * FROM job_assignments');
    console.log('📋 Existing assignments:', allAssignments);

    // Find an employer (any employer)
    const employer = await db.get(
      'SELECT id, name, userClass FROM users WHERE userClass = ? OR userClass = ?',
      ['Employer', 'employer']
    );

    if (!employer) {
      await db.close();
      return NextResponse.json({ 
        error: 'No employer found in database',
        debug: { users: allUsers }
      }, { status: 404 });
    }

    console.log('👔 Found employer:', employer);

    // Find a recruiter
    const recruiter = await db.get(
      'SELECT id, name, userClass FROM users WHERE (userClass = ? OR userClass = ?) AND id != ?',
      ['Recruiter', 'recruiter', employer.id]
    );

    if (!recruiter) {
      await db.close();
      return NextResponse.json({ 
        error: 'No recruiter found in database',
        debug: { users: allUsers, employer: employer }
      }, { status: 404 });
    }

    console.log('🔍 Found recruiter:', recruiter);

    // Find employer's jobs
    const employerJobs = await db.all(
      'SELECT id, title FROM jobs WHERE employerId = ?',
      [employer.id]
    );

    if (employerJobs.length === 0) {
      await db.close();
      return NextResponse.json({ 
        error: 'Employer has no jobs',
        debug: { 
          employer: employer, 
          recruiter: recruiter, 
          allJobs: allJobs 
        }
      }, { status: 404 });
    }

    console.log('💼 Found employer jobs:', employerJobs);

    // Check if assignment already exists
    const existingAssignment = await db.get(
      'SELECT id FROM job_assignments WHERE jobId = ? AND employerId = ? AND recruiterId = ?',
      [employerJobs[0].id, employer.id, recruiter.id]
    );

    if (existingAssignment) {
      await db.close();
      return NextResponse.json({ 
        success: true,
        message: 'Assignment already exists',
        assignmentId: existingAssignment.id,
        debug: {
          employer: employer,
          recruiter: recruiter,
          job: employerJobs[0]
        }
      });
    }

    // Create test assignment with VALID status
    console.log('📝 Creating assignment with "accepted" status...');
    
    const result = await db.run(
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
        employerJobs[0].id, 
        employer.id, 
        recruiter.id, 
        'Test assignment created for debugging', 
        'accepted', // ✅ CHANGED FROM 'hired' TO 'accepted'
        new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    console.log('✅ Assignment created with ID:', result.lastID);

    await db.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Test assignment created successfully!',
      assignmentId: result.lastID,
      debug: {
        employer: employer,
        recruiter: recruiter,
        job: employerJobs[0],
        totalUsers: allUsers.length,
        totalJobs: allJobs.length,
        existingAssignments: allAssignments.length,
        allowedStatuses: ['pending', 'accepted', 'declined', 'completed']
      }
    });

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}