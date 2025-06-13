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

    const notifications = await db.all(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
      [session.user.id]
    );

    await db.close();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    await db.run(
      'UPDATE notifications SET isRead = TRUE WHERE id = ? AND userId = ?',
      [notificationId, session.user.id]
    );

    await db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}