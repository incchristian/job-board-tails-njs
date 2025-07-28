import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId, status, notes } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Get assignment details
    const assignment = await db.get(`
      SELECT 
        ja.*,
        j.title as jobTitle,
        emp.name as employerName,
        rec.name as recruiterName
      FROM job_assignments ja
      JOIN jobs j ON j.id = ja.jobId
      JOIN users emp ON emp.id = ja.employerId
      JOIN users rec ON rec.id = ja.recruiterId
      WHERE ja.id = ?
    `, [assignmentId]);

    if (!assignment) {
      await db.close();
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if user has permission to update this assignment
    const canUpdate = (
      (session.user.userClass === 'Employer' && session.user.id == assignment.employerId) ||
      (session.user.userClass === 'Recruiter' && session.user.id == assignment.recruiterId)
    );

    if (!canUpdate) {
      await db.close();
      return NextResponse.json({ error: 'Not authorized to update this assignment' }, { status: 403 });
    }

    // Update assignment status
    const updateResult = await db.run(
      'UPDATE job_assignments SET status = ?, notes = ?, updatedAt = ? WHERE id = ?',
      [status, notes || assignment.notes, new Date().toISOString(), assignmentId]
    );

    // Create notification for the other party
    const notifyUserId = session.user.userClass === 'Employer' 
      ? assignment.recruiterId 
      : assignment.employerId;

    const notificationMessage = session.user.userClass === 'Employer'
      ? `Assignment status updated to "${status}" by ${assignment.employerName} for: ${assignment.jobTitle}`
      : `Assignment status updated to "${status}" by ${assignment.recruiterName} for: ${assignment.jobTitle}`;

    await db.run(
      'INSERT INTO notifications (userId, type, title, message, relatedId, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        notifyUserId,
        'assignment_status_update',
        'Assignment Status Updated',
        notificationMessage,
        assignmentId,
        false,
        new Date().toISOString()
      ]
    );

    await db.close();

    return NextResponse.json({ 
      success: true, 
      message: 'Assignment status updated successfully',
      assignmentId,
      newStatus: status
    });

  } catch (error: any) {
    console.error('Error updating assignment status:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}