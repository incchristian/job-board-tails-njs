import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Get all jobs with their current status
    const jobsWithStatus = await db.all(`
      SELECT 
        j.id as jobId,
        j.title,
        j.status as jobStatus,
        j.createdAt,
        COUNT(DISTINCT ja.id) as totalAssignments,
        COUNT(DISTINCT CASE WHEN ja.status = 'accepted' THEN ja.id END) as acceptedAssignments,
        COUNT(DISTINCT CASE WHEN jr.status = 'pending' THEN jr.id END) as pendingHires,
        COUNT(DISTINCT CASE WHEN jr.status = 'accepted' THEN jr.id END) as confirmedHires,
        GROUP_CONCAT(DISTINCT u.name) as recruiterNames,
        MAX(ja.updatedAt) as lastUpdate
      FROM jobs j
      LEFT JOIN job_assignments ja ON ja.jobId = j.id AND ja.employerId = j.employerId
      LEFT JOIN job_recruiters jr ON jr.jobId = j.id AND jr.employerId = j.employerId
      LEFT JOIN users u ON u.id = COALESCE(ja.recruiterId, jr.recruiterId)
      WHERE j.employerId = ?
      GROUP BY j.id, j.title, j.status, j.createdAt
      ORDER BY j.createdAt DESC
    `, [session.user.id]);

    await db.close();

    return NextResponse.json({ 
      jobs: jobsWithStatus,
      totalJobs: jobsWithStatus.length 
    });
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}