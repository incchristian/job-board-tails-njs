import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.userClass !== 'Recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, action } = await request.json();
    
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
    });

    if (action === 'accept') {
      // Update job_recruiters status to accepted
      await db.run(
        'UPDATE job_recruiters SET status = ? WHERE jobId = ? AND recruiterId = ?',
        ['accepted', jobId, session.user.id]
      );

      // Update job status
      await db.run(
        'UPDATE jobs SET status = ? WHERE id = ?',
        ['recruiter_assigned', jobId]
      );

      console.log(`✅ Recruiter ${session.user.id} accepted job ${jobId}`);
    } else if (action === 'decline') {
      // Remove from job_recruiters
      await db.run(
        'DELETE FROM job_recruiters WHERE jobId = ? AND recruiterId = ?',
        [jobId, session.user.id]
      );

      // Update job status back to open
      await db.run(
        'UPDATE jobs SET status = ? WHERE id = ?',
        ['open', jobId]
      );

      console.log(`❌ Recruiter ${session.user.id} declined job ${jobId}`);
    }

    await db.close();

    return NextResponse.json({ 
      message: action === 'accept' ? 'Job accepted successfully' : 'Job declined successfully' 
    });
  } catch (error: any) {
    console.error('Error handling job assignment:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
}