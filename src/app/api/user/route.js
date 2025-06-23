import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userClass = searchParams.get('userClass');

    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    let query = 'SELECT id, name, email, userClass, company, bio, profilePicture FROM users WHERE 1=1';
    let params = [];

    if (userClass) {
      query += ' AND userClass = ?';
      params.push(userClass);
    }

    query += ' ORDER BY name ASC';

    const users = await db.all(query, params);

    await db.close();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}