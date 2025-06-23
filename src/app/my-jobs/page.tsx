"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function MyJobsPage() {
  const { data: session, status } = useSession();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const router = useRouter();
  const dropdownRefs = useRef({});

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    if (session.user.userClass !== "Employer") {
      router.push("/");
      return;
    }

    // Fetch user's jobs
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/my-jobs");
        if (response.ok) {
          const jobsData = await response.json();
          setJobs(jobsData);
        } else {
          setError("Failed to load jobs");
        }
      } catch (err) {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session, status, router]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownOpen && dropdownRefs.current[dropdownOpen] && 
          !dropdownRefs.current[dropdownOpen].contains(event.target)) {
        setDropdownOpen(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    setDeleting(jobId);
    setDropdownOpen(null);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        setError("Failed to delete job");
      }
    } catch (err) {
      setError("Failed to delete job");
    } finally {
      setDeleting(null);
    }
  };

  const toggleDropdown = (jobId) => {
    setDropdownOpen(dropdownOpen === jobId ? null : jobId);
  };

  if (status === "loading" || loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading jobs...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
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
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="My Jobs" />
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            My Jobs ({jobs.length})
          </h1>
          <Link
            href="/jobs/post"
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-7 text-center">
              <p className="text-bodydark2 mb-4">You haven't posted any jobs yet.</p>
              <Link
                href="/jobs/post"
                className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
              >
                Post Your First Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link 
                      href={`/jobs/${job.id}`}
                      className="block"
                    >
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                        {job.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-bodydark2 mb-2">📍 {job.location}</p>
                    <p className="text-sm text-bodydark2 mb-4 line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                  
                  {/* Three-dot menu */}
                  <div 
                    className="relative"
                    ref={el => dropdownRefs.current[job.id] = el}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown(job.id);
                      }}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Job options"
                    >
                      <svg 
                        className="w-5 h-5 text-bodydark2" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {/* Dropdown menu */}
                    {dropdownOpen === job.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setDropdownOpen(null)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Link>
                          <Link
                            href={`/jobs/edit/${job.id}`}
                            className="flex items-center px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setDropdownOpen(null)}
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Job
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deleting === job.id}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-left"
                          >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {deleting === job.id ? "Deleting..." : "Delete Job"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-bodydark2 border-t border-stroke dark:border-strokedark pt-4">
                  <div className="flex justify-between">
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}