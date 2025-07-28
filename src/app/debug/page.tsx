'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching debug data...');
      
      const response = await fetch('/api/job-assignments', {
        method: 'OPTIONS',
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📊 Response data:', result);
      setData(result);
    } catch (error) {
      console.error('❌ Error fetching debug data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    try {
      setTestResult({ loading: true });
      console.log('🧪 Creating test data...');
      
      const response = await fetch('/api/create-test-data', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📡 Test creation response status:', response.status);
      
      const result = await response.json();
      console.log('📊 Test creation result:', result);
      
      setTestResult(result);
      
      if (result.success) {
        // Refresh the data after successful creation
        await fetchDebugData();
      }
    } catch (error) {
      console.error('❌ Error creating test data:', error);
      setTestResult({ 
        error: error.message,
        success: false 
      });
    }
  };

  const checkDatabase = async () => {
    try {
      console.log('🔍 Checking database structure...');
      
      const response = await fetch('/api/job-assignments', {
        method: 'CHECK',
      });
      
      const result = await response.json();
      console.log('🗃️ Database schema:', result);
      alert('Check console for database schema info');
    } catch (error) {
      console.error('❌ Error checking database:', error);
      alert('Error checking database: ' + error.message);
    }
  };

  // Add this function to your debug page component
  const migrateRecruiters = async () => {
    try {
      console.log('🔄 Starting migration...');
      const response = await fetch('/api/migrate-recruiters', { method: 'POST' });
      const result = await response.json();
      console.log('📊 Migration result:', result);
      
      if (result.success) {
        alert(`Migration successful! Migrated ${result.results.migrated} assignments.`);
        // Refresh the data after migration
        await fetchDebugData();
      } else {
        alert('Migration failed: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Migration error:', error);
      alert('Migration error: ' + error.message);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Database Debug Info</h1>
        <div className="space-x-2">
          <button 
            onClick={fetchDebugData}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Data
          </button>
          <button 
            onClick={createTestData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={testResult?.loading}
          >
            {testResult?.loading ? 'Creating...' : 'Create Test Assignment'}
          </button>
          <button 
            onClick={checkDatabase}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Check DB Schema
          </button>
          {/* Add this button to your JSX (in the buttons section) */}
          <button 
            onClick={migrateRecruiters}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            Migrate Old Assignments
          </button>
        </div>
      </div>

      {/* Test Result Display */}
      {testResult && (
        <div className={`p-4 rounded mb-6 ${
          testResult.success ? 'bg-green-50 border border-green-200' : 
          testResult.error ? 'bg-red-50 border border-red-200' : 
          'bg-blue-50 border border-blue-200'
        }`}>
          <h3 className="font-semibold mb-2">Test Data Creation Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
          <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading debug data...</p>
        </div>
      )}

      {/* Data Display */}
      {!loading && data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Users */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">
                Users ({data?.users?.length || 0})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.users?.map((user, index) => (
                  <div key={index} className="border-b pb-2 text-sm">
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Class:</strong> <span className={
                      user.userClass === 'Employer' ? 'text-green-600 font-semibold' :
                      user.userClass === 'Recruiter' ? 'text-blue-600 font-semibold' :
                      'text-gray-600'
                    }>{user.userClass}</span></p>
                  </div>
                ))}
              </div>
            </div>

            {/* Jobs */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-green-600">
                Jobs ({data?.jobs?.length || 0})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.jobs?.map((job, index) => (
                  <div key={index} className="border-b pb-2 text-sm">
                    <p><strong>ID:</strong> {job.id}</p>
                    <p><strong>Title:</strong> {job.title}</p>
                    <p><strong>Employer ID:</strong> {job.employerId}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assignments */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-purple-600">
                Job Assignments ({data?.assignments?.length || 0})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.assignments?.length > 0 ? (
                  data.assignments.map((assignment, index) => (
                    <div key={index} className="border-b pb-2 text-sm">
                      <p><strong>ID:</strong> {assignment.id}</p>
                      <p><strong>Job ID:</strong> {assignment.jobId}</p>
                      <p><strong>Employer ID:</strong> {assignment.employerId}</p>
                      <p><strong>Recruiter ID:</strong> {assignment.recruiterId}</p>
                      <p><strong>Status:</strong> <span className={
                        assignment.status === 'accepted' ? 'text-green-600 font-semibold' :
                        assignment.status === 'pending' ? 'text-yellow-600 font-semibold' :
                        'text-red-600 font-semibold'
                      }>{assignment.status || 'pending'}</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-red-500 font-semibold">❌ No assignments found!</p>
                )}
              </div>
            </div>
          </div>

          {/* Console Log Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debugging Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open Developer Tools (F12)</li>
              <li>Go to Console tab</li>
              <li>Click "Create Test Assignment" and watch for errors</li>
              <li>Go to Network tab and check the API response</li>
              <li>Report any error messages you see</li>
            </ol>
          </div>

          {/* Raw Data */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Raw Database Data:</h3>
            <pre className="text-xs overflow-auto bg-gray-100 p-3 rounded max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}