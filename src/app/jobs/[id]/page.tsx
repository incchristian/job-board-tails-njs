"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import JobDetailsClient from "./JobDetailsClient";

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        if (response.ok) {
          const jobData = await response.json();
          setJob(jobData);
        } else if (response.status === 404) {
          setError("Job not found");
        } else {
          setError("Failed to load job");
        }
      } catch (err) {
        setError("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
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