import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assignmentId } = await req.json();

    // Here you would:
    // 1. Update assignment status to 'completed'
    // 2. Trigger smart contract payment release
    // 3. Send notification to recruiter
    
    console.log(`Completing assignment ${assignmentId} and releasing payment`);

    // Mock success response
    return NextResponse.json({ 
      success: true, 
      message: 'Assignment completed and payment released' 
    });
  } catch (error) {
    console.error('Error completing assignment:', error);
    return NextResponse.json(
      { error: 'Failed to complete assignment' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data - replace with your database query
    const assignments = [
      {
        id: 1,
        jobId: 1,
        jobTitle: "Senior React Developer",
        recruiterId: 2,
        recruiterName: "John Smith",
        recruiterEmail: "john@example.com",
        recruiterProfilePicture: "/images/user/user-02.png",
        status: "in_progress",
        paymentMethod: "paypal",
        paymentAmount: 150,
        message: "Looking for senior developers with 5+ years experience",
        createdAt: "2024-01-15T10:00:00Z",
        acceptedAt: "2024-01-15T14:30:00Z",
        candidatesFound: 3,
        paypalOrderId: "PP_123456789"
      },
      {
        id: 2,
        jobId: 2,
        jobTitle: "Full Stack Engineer",
        recruiterId: 3,
        recruiterName: "Sarah Johnson",
        recruiterEmail: "sarah@example.com",
        recruiterProfilePicture: "/images/user/user-03.png",
        status: "pending",
        paymentMethod: "crypto",
        paymentAmount: 0.05,
        message: "Need someone with Node.js and React experience",
        createdAt: "2024-01-16T09:00:00Z",
        candidatesFound: 0,
        blockchainTxHash: "0x1234567890abcdef"
      }
    ];

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

async function getPayPalAccessToken() {
  const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}