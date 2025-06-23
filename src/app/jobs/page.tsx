"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JobsMap from "./JobsMap";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  employerId: number;
  employerName?: string;
  logoPath?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
}

const JobsPage = () => {
  const { data: session, status } = useSession();
  const [userClass, setUserClass] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get userClass from token
  useEffect(() => {
    const getUserClass = async () => {
      try {
        const response = await fetch("/api/auth/token");
        const token = await response.json();
        setUserClass(token?.userClass || "JobSeeker");
      } catch (error) {
        console.error("Error fetching token:", error);
        setUserClass("JobSeeker");
      }
    };

    if (session) {
      getUserClass();
    } else if (status === "unauthenticated") {
      setUserClass("JobSeeker");
    }
  }, [session, status]);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (response.ok) {
          const jobsData = await response.json();
          setJobs(jobsData);
          setFilteredJobs(jobsData);
        } else {
          setError("Failed to load jobs");
        }
      } catch (err) {
        setError("Failed to load jobs");
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchJobs();
    }
  }, [mounted]);

  // Filter jobs based on search and location
  useEffect(() => {
    if (!mounted) return;

    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobs, mounted]);

  // Open popup window function
  const openMapPopup = () => {
    const popupFeatures = [
      'width=1200',
      'height=800',
      'left=100',
      'top=100',
      'scrollbars=yes',
      'resizable=yes',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'status=no'
    ].join(',');

    window.open('/jobs/map-popup', 'mapPopup', popupFeatures);
  };

  if (loading) {
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

  // Check if user can access jobs management
  if (session && userClass && !["Employer", "Recruiter"].includes(userClass)) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p>
              Only employers and recruiters can manage jobs. You are registered as a{" "}
              {userClass}.
            </p>
            <Link
              href="/"
              className="text-blue-500 hover:underline mt-4 block"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Browse Jobs" />

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            All Jobs ({filteredJobs.length})
          </h1>
        </div>

        {/* Full-width Google Map with overlay button */}
        <div className="w-screen h-80 mb-6 relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <JobsMap jobs={filteredJobs} />
          
          {/* View Full Map button - overlaid on map */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={openMapPopup}
              className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-opacity-90 shadow-lg backdrop-blur-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              View Full Map
            </button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Search Jobs
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Filter by Location
                </label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  placeholder="Filter by location..."
                  className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Cards Grid */}
        {error ? (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-7 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="p-7 text-center">
              <p className="text-bodydark2">No jobs found matching your criteria.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <Link href={`/jobs/${job.id}`}>
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-bodydark2 mb-2">📍 {job.location}</p>
                  <p className="text-sm text-bodydark2 mb-4 line-clamp-3">
                    {job.description}
                  </p>
                </div>
                
                <div className="mb-4 text-xs text-bodydark2">
                  <div>Posted: {new Date(job.createdAt).toLocaleDateString()}</div>
                  <div>Status: <span className="text-green-600">Open</span></div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="w-full px-3 py-2 bg-primary text-white rounded text-sm text-center hover:bg-opacity-90 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default JobsPage;