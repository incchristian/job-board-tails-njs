import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    let contacts;
    
    if (session.user.userClass === 'employer') {
      // Get recruiters that accepted this employer's requests
      contacts = await db.all(`
        SELECT 
          c.*,
          u.id as contactId,
          u.name,
          u.email,
          u.userClass,
          u.company,
          u.bio,
          u.profilePicture
        FROM contacts c
        JOIN users u ON u.id = c.recruiterId
        WHERE c.employerId = ? AND c.status = 'accepted'
        ORDER BY c.createdAt DESC
      `, [session.user.id]);
    } else if (session.user.userClass === 'recruiter') {
      // Get employers that this recruiter accepted
      contacts = await db.all(`
        SELECT 
          c.*,
          u.id as contactId,
          u.name,
          u.email,
          u.userClass,
          u.company,
          u.bio,
          u.profilePicture
        FROM contacts c
        JOIN users u ON u.id = c.employerId
        WHERE c.recruiterId = ? AND c.status = 'accepted'
        ORDER BY c.createdAt DESC
      `, [session.user.id]);
    } else {
      contacts = [];
    }

    await db.close();

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}