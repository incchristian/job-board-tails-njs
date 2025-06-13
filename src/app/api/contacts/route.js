import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'employer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recruiterId } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    // Get employer info
    const employer = await db.get('SELECT name FROM users WHERE id = ?', [session.user.id]);

    // Insert contact relationship
    await db.run(
      'INSERT OR IGNORE INTO contacts (employerId, recruiterId, status, notified) VALUES (?, ?, ?, ?)',
      [session.user.id, recruiterId, 'pending', true]
    );

    // Create notification for the recruiter
    await db.run(
      'INSERT INTO notifications (userId, type, title, message, relatedId) VALUES (?, ?, ?, ?, ?)',
      [
        recruiterId,
        'contact_request',
        'New Contact Request',
        `${employer.name} wants to add you to their contacts`,
        session.user.id
      ]
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle accept/decline
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employerId, action } = await request.json(); // action: 'accept' or 'decline'

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    if (action === 'accept') {
      // Update contact status to accepted
      await db.run(
        'UPDATE contacts SET status = ? WHERE employerId = ? AND recruiterId = ?',
        ['accepted', employerId, session.user.id]
      );

      // Create notification for employer
      const recruiter = await db.get('SELECT name FROM users WHERE id = ?', [session.user.id]);
      await db.run(
        'INSERT INTO notifications (userId, type, title, message) VALUES (?, ?, ?, ?)',
        [
          employerId,
          'contact_accepted',
          'Contact Request Accepted',
          `${recruiter.name} accepted your contact request`
        ]
      );
    } else {
      // Remove the contact request
      await db.run(
        'DELETE FROM contacts WHERE employerId = ? AND recruiterId = ?',
        [employerId, session.user.id]
      );
    }

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}