"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import JobDetailsClient from "./JobDetailsClient";

export default function JobDetailsPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log("Fetching job with ID:", params.id);
        const response = await fetch(`/api/jobs/${params.id}`);
        console.log("Response status:", response.status);

        if (response.ok) {
          const jobData = await response.json();
          console.log("Job data received:", jobData);

          // The API returns { job: ... }, so extract the job
          setJob(jobData.job || jobData);
        } else if (response.status === 404) {
          setError("Job not found");
        } else {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          setError("Failed to load job");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return <JobDetailsClient job={job} session={session} />;
}