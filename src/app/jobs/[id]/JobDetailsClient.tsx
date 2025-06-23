"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

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

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl">
        <Breadcrumb pageName="Job Details" />
        
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-7 py-4 border-b border-stroke dark:border-strokedark">
            <h1 className="text-2xl font-bold text-black dark:text-white">
              {job.title}
            </h1>
            <p className="text-bodydark2 mt-2">
              📍 {job.location}
            </p>
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

              {/* Show buttons for employers - removed the employerId check for now */}
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
    </DefaultLayout>
  );
}