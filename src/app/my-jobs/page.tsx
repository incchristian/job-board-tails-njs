import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function fetchUserJobs(employerId: string) {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  
  const jobs = await db.all(
    `SELECT id, title, description, location, employerId, logoPath, 
            lat, lng, country, state, street, city, postalCode 
     FROM jobs WHERE employerId = ?`,
    [employerId]
  );
  
  await db.close();
  return jobs;
}

export default async function MyJobsPage({ searchParams }: { searchParams?: Promise<{ delete?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-6">
          <p>Please log in to view your jobs.</p>
        </div>
      </DefaultLayout>
    );
  }

  // Check if user is an employer OR recruiter
  const isEmployerOrRecruiter = session?.user?.userClass === 'employer' || session?.user?.userClass === 'recruiter';
  if (!isEmployerOrRecruiter) {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-6">
          <p>Only employers and recruiters can manage jobs. You are registered as a candidate.</p>
          <Link href="/jobs" className="text-blue-500 hover:underline">
            Browse available jobs
          </Link>
        </div>
      </DefaultLayout>
    );
  }

  const jobs = await fetchUserJobs(session.user.id);

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">My Jobs</h1>
        
        {jobs.length === 0 ? (
          <p className="text-gray-600">
            You haven&apos;t posted any jobs yet.{" "}
            <Link href="/jobs/post" className="text-primary hover:underline">
              Post a job now
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col h-64 w-full relative"
              >
                <h2 className="text-xl font-semibold mb-2 truncate">{job.title}</h2>
                <p className="text-gray-600 mb-2 flex-grow overflow-hidden">{job.description}</p>
                <p className="text-gray-500 text-sm">📍 {job.location}</p>
                
                <div className="mt-2 flex gap-2">
                  <Link 
                    href={`/jobs/edit/${job.id}`}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                  >
                    Edit
                  </Link>
                  <button 
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    onClick={() => {/* Add delete functionality later */}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}