"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import JobsMap from "../JobsMap";

export default function JobDetailsClient({ job, session }) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setApplying(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobSeekerId: session.user.id }),
      });

      if (response.ok) {
        setMessage("Application submitted successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to apply for job");
      }
    } catch (err) {
      setError("Failed to apply for job");
    } finally {
      setApplying(false);
    }
  };

  const handleHireRecruiter = async () => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    setHiring(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/jobs/${job.id}/hire-recruiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterId: session.user.id }),
      });

      if (response.ok) {
        setMessage("Recruiting assignment accepted successfully!");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to accept recruiting assignment");
      }
    } catch (err) {
      setError("Failed to accept recruiting assignment");
    } finally {
      setHiring(false);
    }
  };

  // Prepare job data for map (single job)
  const jobForMap = [{
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    lat: job.lat,
    lng: job.lng
  }];

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Job Details" />
        
        {/* Two column layout: Job details on left, Map on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left column - Job Details (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="px-7 py-4 border-b border-stroke dark:border-strokedark">
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  {job.title}
                </h1>
              </div>

              <div className="p-7">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
                    Job Description
                  </h3>
                  <div className="text-bodydark2 whitespace-pre-wrap">
                    {job.description}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
                    Job Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-black dark:text-white">Posted:</span>
                      <span className="ml-2 text-bodydark2">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-black dark:text-white">Status:</span>
                      <span className="ml-2 text-bodydark2">Open</span>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                    {error}
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {/* Show different buttons based on user type */}
                  {session?.user?.userClass === "JobSeeker" && (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="flex justify-center rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {applying ? "Applying..." : "Apply for Job"}
                    </button>
                  )}

                  {session?.user?.userClass === "Recruiter" && (
                    <button
                      onClick={handleHireRecruiter}
                      disabled={hiring}
                      className="flex justify-center rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {hiring ? "Hiring..." : "Accept Recruiting Assignment"}
                    </button>
                  )}

                  {/* Show buttons for employers */}
                  {session?.user?.userClass === "Employer" && (
                    <>
                      <Link
                        href={`/jobs/edit/${job.id}`}
                        className="flex justify-center rounded bg-blue-600 px-6 py-3 font-medium text-white hover:bg-opacity-90"
                      >
                        Edit Job
                      </Link>
                      <Link
                        href={`/jobs/${job.id}/hire-recruiter`}
                        className="flex justify-center rounded bg-green-600 px-6 py-3 font-medium text-white hover:bg-opacity-90"
                      >
                        Hire a Recruiter
                      </Link>
                    </>
                  )}

                  {!session && (
                    <Link
                      href="/api/auth/signin"
                      className="flex justify-center rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                    >
                      Sign In to Apply
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Map (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark h-fit sticky top-6">
              <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Job Location
                </h3>
              </div>
              <div className="p-0">
                {/* Map container with taller height */}
                <div className="h-[500px] w-full overflow-hidden rounded-b-sm">
                  <JobsMap jobs={jobForMap} singleJobZoom={true} />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-stroke dark:border-strokedark">
                <div className="text-center">
                  <p className="text-sm font-medium text-black dark:text-white mb-1">📍 {job.location}</p>
                  <p className="text-xs text-bodydark2">Click map to view in detail</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DefaultLayout>
  );
}