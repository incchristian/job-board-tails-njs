'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function TestAssignmentsPage() {
  const { data: session, status } = useSession();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) return;

    fetchAssignments();
  }, [session, status]);

  const fetchAssignments = async () => {
    try {
      console.log('🔍 Fetching assignments for user:', session.user);
      setLoading(true);
      
      const response = await fetch('/api/job-assignments');
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📊 API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assignments');
      }
      
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') return <div className="p-8">Loading session...</div>;
  if (!session) return <div className="p-8">Please log in</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assignment Test Page</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h3 className="font-semibold">Session Info:</h3>
        <p>User: {session.user?.name}</p>
        <p>Email: {session.user?.email}</p>
        <p>User Class: {session.user?.userClass}</p>
        <p>User ID: {session.user?.id}</p>
      </div>

      <button 
        onClick={fetchAssignments}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
      >
        🔄 Refresh Assignments
      </button>

      {loading && <p>Loading assignments...</p>}
      {error && <p className="text-red-500">❌ Error: {error}</p>}

      <div className="bg-white border rounded p-4">
        <h2 className="text-xl font-semibold mb-4">
          📋 Job Assignments ({assignments.length})
        </h2>
        
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No assignments found</p>
            <p className="text-sm text-gray-400">
              {session.user?.userClass === 'Employer' 
                ? 'Try hiring a recruiter for one of your jobs first'
                : 'No jobs assigned to you yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={index} className="border rounded p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{assignment.jobTitle}</h3>
                    <p className="text-gray-600">
                      {session.user?.userClass === 'Employer' 
                        ? `Recruiter: ${assignment.recruiterName}`
                        : `Employer: ${assignment.employerName}`
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      Assignment ID: {assignment.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        assignment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        assignment.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status || 'pending'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Created: {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Updated: {assignment.updatedAt ? new Date(assignment.updatedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {assignment.message && (
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <p className="text-sm"><strong>Message:</strong> {assignment.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-xs bg-gray-50 p-4 rounded">
        <h4 className="font-semibold">🔍 Debug Info:</h4>
        <pre className="mt-2 overflow-auto">
          {JSON.stringify({ 
            sessionUser: session?.user, 
            assignmentsCount: assignments.length,
            sampleAssignment: assignments[0] || null
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}