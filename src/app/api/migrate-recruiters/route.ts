import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function POST() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    console.log('🔄 Starting migration from job_recruiters to job_assignments...');

    // Get all existing job_recruiters entries
    const jobRecruiters = await db.all(`
      SELECT 
        jr.*,
        j.title as jobTitle,
        emp.name as employerName,
        rec.name as recruiterName
      FROM job_recruiters jr
      JOIN jobs j ON j.id = jr.jobId
      JOIN users emp ON emp.id = jr.employerId
      JOIN users rec ON rec.id = jr.recruiterId
    `);

    console.log(`📋 Found ${jobRecruiters.length} job_recruiters entries`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const jr of jobRecruiters) {
      // Check if this assignment already exists in job_assignments
      const existingAssignment = await db.get(
        'SELECT id FROM job_assignments WHERE jobId = ? AND employerId = ? AND recruiterId = ?',
        [jr.jobId, jr.employerId, jr.recruiterId]
      );

      if (existingAssignment) {
        console.log(`⏭️ Skipping: Assignment already exists for job ${jr.jobId}`);
        skippedCount++;
        continue;
      }

      // Map job_recruiters status to job_assignments status
      let assignmentStatus = 'pending';
      switch (jr.status) {
        case 'pending':
          assignmentStatus = 'pending';
          break;
        case 'hired':
        case 'accepted':
          assignmentStatus = 'accepted';
          break;
        case 'declined':
          assignmentStatus = 'declined';
          break;
        case 'completed':
          assignmentStatus = 'completed';
          break;
        default:
          assignmentStatus = 'accepted'; // Default for unknown statuses
      }

      // Create corresponding job_assignments entry
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
          jr.jobId,
          jr.employerId,
          jr.recruiterId,
          `Migrated from job_recruiters: ${jr.jobTitle}`,
          assignmentStatus,
          jr.hiredAt || new Date().toISOString(),
          new Date().toISOString()
        ]
      );

      console.log(`✅ Migrated: ${jr.employerName} -> ${jr.recruiterName} for "${jr.jobTitle}" (Status: ${assignmentStatus})`);
      migratedCount++;
    }

    await db.close();

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      results: {
        totalJobRecruiters: jobRecruiters.length,
        migrated: migratedCount,
        skipped: skippedCount,
        details: jobRecruiters.map(jr => ({
          jobTitle: jr.jobTitle,
          employer: jr.employerName,
          recruiter: jr.recruiterName,
          originalStatus: jr.status,
          hiredAt: jr.hiredAt
        }))
      }
    });

  } catch (error) {
    console.error('❌ Migration error:', error);
    return NextResponse.json({
      error: 'Migration failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}