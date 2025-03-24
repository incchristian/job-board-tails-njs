import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function fetchAllJobs() {
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  const jobs = await db.all("SELECT id, title, description, location, logoPath FROM jobs");
  await db.close();
  return jobs;
}

export default async function JobPostsPage() {
  const jobs = await fetchAllJobs();

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Job Posts" />
      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Job Posts
          </h4>

          <div className="flex flex-col">
            <div className="grid grid-cols-4 rounded-sm bg-gray-2 dark:bg-meta-4">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">Logo</h5>
              </div>
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:test-base">Title</h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">Description</h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base">Location</h5>
              </div>
            </div>

            {jobs.length === 0 ? (
              <p className="p-2.5 text-center">No jobs available.</p>
            ) : (
              jobs.map((job) => (
                <div
                  className="grid grid-cols-4 border-b border-stroke dark:border-strokedark"
                  key={job.id}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    {job.logoPath ? (
                      <Image src={job.logoPath} width={32} height={32} alt="Job Logo" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-2 dark:bg-meta-4"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="text-black dark:text-white">{job.title}</p>
                  </div>
                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-black dark:text-white">{job.description}</p>
                  </div>
                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-black dark:text-white">{job.location}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}