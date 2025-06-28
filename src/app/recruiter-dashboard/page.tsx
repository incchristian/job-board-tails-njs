"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";

export default function RecruiterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }
    if (session.user.userClass !== "Recruiter") {
      router.push("/");
      return;
    }

    const fetchAssignedJobs = async () => {
      try {
        const response = await fetch("/api/recruiter/assigned-jobs");
        if (response.ok) {
          const data = await response.json();
          setAssignedJobs(data.jobs || []);
        }
      } catch (error) {
        console.error("Failed to fetch assigned jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedJobs();
  }, [session, status, router]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Recruiter Dashboard" />

        <div className="grid grid-cols-1 gap-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                  <span className="text-xl">📋</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-black dark:text-white">
                    {assignedJobs.length}
                  </h4>
                  <span className="text-sm font-medium">Active Jobs</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-3 dark:bg-meta-4">
                  <span className="text-xl">👥</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-black dark:text-white">
                    {assignedJobs.reduce((total, job) => total + (job.candidateCount || 0), 0)}
                  </h4>
                  <span className="text-sm font-medium">Candidates Submitted</span>
                </div>
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-meta-5 dark:bg-meta-4">
                  <span className="text-xl">⭐</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-black dark:text-white">
                    87%
                  </h4>
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Jobs */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                My Assigned Jobs
              </h3>
            </div>

            <div className="p-7">
              {assignedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    No Jobs Assigned Yet
                  </h3>
                  <p className="text-bodydark2 mb-4">
                    When employers hire you for jobs, they will appear here.
                  </p>
                  <Link
                    href="/jobs"
                    className="inline-flex items-center justify-center rounded-md border border-primary px-6 py-2 text-center font-medium text-primary hover:bg-opacity-90"
                  >
                    Browse Available Jobs
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {assignedJobs.map((job) => (
                    <div
                      key={job.id}
                      className="rounded-lg border border-stroke p-6 dark:border-strokedark"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-black dark:text-white mb-2">
                            {job.title}
                          </h4>
                          <p className="text-bodydark2 mb-2">
                            <strong>Company:</strong> {job.companyName}
                          </p>
                          <p className="text-bodydark2 mb-2">
                            <strong>Location:</strong> {job.location}
                          </p>
                          <p className="text-bodydark2 mb-2">
                            <strong>Salary:</strong> ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                            job.status === 'recruiter_assigned' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                              : job.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {job.status === 'recruiter_assigned' && 'Assigned'}
                            {job.status === 'in_progress' && 'In Progress'}
                            {job.status === 'completed' && 'Completed'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-bodydark2">
                          <span>Candidates Submitted: {job.candidateCount || 0}</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="inline-flex items-center justify-center rounded border border-primary px-4 py-2 text-center font-medium text-primary hover:bg-opacity-90"
                          >
                            View Job
                          </Link>
                          <Link
                            href={`/recruiter-dashboard/find-candidates/${job.id}`}
                            className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
                          >
                            Find Candidates
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}