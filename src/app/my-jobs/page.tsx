import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import JobDropdown from "./JobDropdown"; // New Client Component

async function fetchMyJobs(userId) {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  const jobs = await db.all(
    "SELECT id, title, description, location FROM jobs WHERE employerId = ?",
    [userId]
  );
  await db.close();
  return jobs;
}

async function deleteJob(jobId) {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  await db.run("DELETE FROM jobs WHERE id = ?", [jobId]);
  await db.close();
}

export default async function MyJobsPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id; // Adjust if needed
  const userClass = session?.user?.userClass || "Candidate";

  if (!session) {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">My Job Listings</h1>
          <p className="text-gray-600">Please log in to view your jobs.</p>
        </div>
      </DefaultLayout>
    );
  }

  if (userClass === "Candidate") {
    return (
      <DefaultLayout>
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">My Job Listings</h1>
          <p className="text-gray-600">This page is only for employers.</p>
        </div>
      </DefaultLayout>
    );
  }

  // Handle delete action
  if (searchParams?.delete) {
    await deleteJob(searchParams.delete);
    revalidatePath("/my-jobs");
    redirect("/my-jobs");
  }

  const jobs = await fetchMyJobs(userId);

  return (
    <DefaultLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">My Job Listings</h1>
        {jobs.length === 0 ? (
          <p className="text-gray-600">You haven’t posted any jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col h-64 w-full relative"
              >
                <h2 className="text-xl font-semibold mb-2 truncate">{job.title}</h2>
                <p className="text-gray-600 mb-2 flex-grow overflow-hidden">
                  {job.description}
                </p>
                <p className="text-gray-500 text-sm">📍 {job.location}</p>
                <JobDropdown jobId={job.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}