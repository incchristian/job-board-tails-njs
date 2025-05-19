import sqlite3 from "sqlite3";
import { open } from "sqlite";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobsMap from "./JobsMap";

async function fetchJobs() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });
  const jobs = await db.all(
    "SELECT id, title, description, location, country, state, lat, lng FROM jobs"
  );
  await db.close();
  return jobs;
}

export default async function JobPage() {
  const jobs = await fetchJobs();

  return (
    <DefaultLayout>
      {/* Map Section - Full width of the screen */}
      <div className="w-screen">
        <JobsMap jobs={jobs} />
      </div>
      {/* Job Listings - Constrained width for readability */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-lg shadow-md flex flex-col h-64 w-full"
            >
              <h2 className="text-xl font-semibold mb-2 truncate">{job.title}</h2>
              <p className="text-gray-600 mb-2 flex-grow overflow-hidden">{job.description}</p>
              <p className="text-gray-500 text-sm">
                📍 {job.location ? `${job.location}, ` : ""}{job.state}, {job.country}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
}