"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function HireRecruiterPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.userClass !== "Employer") {
      router.push("/api/auth/signin");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${params.id}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData);
        } else {
          setError("Job not found");
          return;
        }

        // Fetch available recruiters
        const recruitersResponse = await fetch("/api/recruiters");
        if (recruitersResponse.ok) {
          const recruitersData = await recruitersResponse.json();
          setRecruiters(recruitersData);
        } else {
          setError("Failed to load recruiters");
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, params.id]);

  const handleHireRecruiter = async (recruiterId) => {
    setHiring(recruiterId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/jobs/${params.id}/hire-recruiter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recruiterId,
          jobId: params.id,
          employerId: session.user.id 
        }),
      });

      if (response.ok) {
        setMessage("Recruiter hired successfully!");
        setTimeout(() => router.push("/my-jobs"), 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to hire recruiter");
      }
    } catch (err) {
      setError("Failed to hire recruiter");
    } finally {
      setHiring(null);
    }
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (error && !job) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl">
        <Breadcrumb pageName="Hire a Recruiter" />
        
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Job: {job?.title}
            </h3>
            <p className="text-bodydark2 mt-1">📍 {job?.location}</p>
          </div>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Available Recruiters
            </h3>
          </div>
          
          <div className="p-7">
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

            {recruiters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-bodydark2">No recruiters available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recruiters.map((recruiter) => (
                  <div
                    key={recruiter.id}
                    className="border border-stroke dark:border-strokedark rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                          {recruiter.name}
                        </h4>
                        <p className="text-bodydark2 mb-2">📧 {recruiter.email}</p>
                        {recruiter.specialization && (
                          <p className="text-bodydark2 mb-2">
                            🎯 Specialization: {recruiter.specialization}
                          </p>
                        )}
                        {recruiter.experience && (
                          <p className="text-bodydark2 mb-4">
                            💼 Experience: {recruiter.experience} years
                          </p>
                        )}
                        <div className="flex items-center mb-4">
                          <span className="text-sm font-medium text-black dark:text-white mr-2">
                            Rating:
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (recruiter.rating || 4) 
                                    ? "text-yellow-400" 
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-bodydark2">
                              ({recruiter.rating || 4.0}/5.0)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleHireRecruiter(recruiter.id)}
                      disabled={hiring === recruiter.id}
                      className="w-full flex justify-center rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      {hiring === recruiter.id ? "Hiring..." : "Hire This Recruiter"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
              <Link
                href={`/jobs/${params.id}`}
                className="inline-flex items-center justify-center rounded bg-bodydark px-6 py-3 font-medium text-white hover:bg-opacity-90"
              >
                ← Back to Job Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}