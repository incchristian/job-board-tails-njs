"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  employerId: number;
  logoPath?: string;
  lat?: number;
  lng?: number;
  country?: string;
  state?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
}

interface MyJobsClientProps {
  jobs: Job[];
  userClass: string;
}

export default function MyJobsClient({ jobs, userClass }: MyJobsClientProps) {
  const router = useRouter();
  const [deletingJob, setDeletingJob] = useState<number | null>(null);

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    setDeletingJob(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh(); // Refresh the page to show updated data
        alert('Job deleted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('An error occurred while deleting the job');
    } finally {
      setDeletingJob(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          My Jobs ({jobs.length})
        </h1>
        {userClass === 'Employer' && (
          <Link
            href="/jobs/post"
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            Post New Job
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-bodydark2 mb-4">
            {userClass === 'Employer' 
              ? "You haven't posted any jobs yet." 
              : "No jobs assigned to you yet."
            }
          </p>
          {userClass === 'Employer' && (
            <Link
              href="/jobs/post"
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              Post Your First Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-boxdark p-4 rounded-lg shadow-md border border-stroke dark:border-strokedark flex flex-col h-64 w-full relative"
            >
              <h2 className="text-xl font-semibold mb-2 truncate text-black dark:text-white">
                {job.title}
              </h2>
              <p className="text-bodydark2 mb-2 flex-grow overflow-hidden line-clamp-3">
                {job.description}
              </p>
              <p className="text-bodydark2 text-sm mb-3">
                📍 {job.location}
              </p>   

              <div className="mt-auto flex gap-2">
                <Link
                  href={`/jobs/${job.id}`}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  View
                </Link>
                {userClass === 'Employer' && (
                  <>
                    <Link
                      href={`/jobs/edit/${job.id}`}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                      onClick={() => handleDeleteJob(job.id)}
                      disabled={deletingJob === job.id}
                    >
                      {deletingJob === job.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}