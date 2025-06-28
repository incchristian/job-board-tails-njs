"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function FindCandidates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId;
  
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.userClass !== "Recruiter") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          setJob(jobData.job);
        }

        // Fetch available candidates
        const candidatesResponse = await fetch("/api/recruiter/available-candidates");
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          setCandidates(candidatesData.candidates || []);
        }
      } catch (error) {
        console.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, jobId]);

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSubmitCandidates = async () => {
    if (selectedCandidates.length === 0) {
      alert("Please select at least one candidate");
      return;
    }

    try {
      const response = await fetch("/api/recruiter/submit-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          candidateIds: selectedCandidates
        }),
      });

      if (response.ok) {
        alert("Candidates submitted successfully!");
        router.push("/recruiter-dashboard");
      } else {
        alert("Failed to submit candidates");
      }
    } catch (error) {
      console.error("Error submitting candidates:", error);
      alert("Failed to submit candidates");
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

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Find Candidates" />

        {/* Job Details */}
        {job && (
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-4">
              {job.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-bodydark2 mb-1"><strong>Company:</strong> {job.companyName}</p>
                <p className="text-bodydark2 mb-1"><strong>Location:</strong> {job.location}</p>
              </div>
              <div>
                <p className="text-bodydark2 mb-1"><strong>Experience:</strong> {job.experienceLevel}</p>
                <p className="text-bodydark2 mb-1"><strong>Type:</strong> {job.employmentType}</p>
              </div>
              <div>
                <p className="text-bodydark2 mb-1"><strong>Salary:</strong> ${job.minSalary?.toLocaleString()} - ${job.maxSalary?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Selection */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">
              Available Candidates ({candidates.length})
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-bodydark2">
                Selected: {selectedCandidates.length}
              </span>
              {selectedCandidates.length > 0 && (
                <button
                  onClick={handleSubmitCandidates}
                  className="inline-flex items-center justify-center rounded bg-primary px-6 py-2 text-center font-medium text-white hover:bg-opacity-90"
                >
                  Submit Candidates
                </button>
              )}
            </div>
          </div>

          <div className="p-7">
            {candidates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  No Candidates Available
                </h3>
                <p className="text-bodydark2">
                  There are no job seekers registered yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                      selectedCandidates.includes(candidate.id)
                        ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                        : 'border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-gray-800'
                    }`}
                    onClick={() => handleSelectCandidate(candidate.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => handleSelectCandidate(candidate.id)}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <h4 className="text-lg font-semibold text-black dark:text-white">
                            {candidate.name}
                          </h4>
                        </div>
                        <p className="text-bodydark2 mb-2">
                          <strong>Email:</strong> {candidate.email}
                        </p>
                        {candidate.bio && (
                          <p className="text-bodydark2 mb-2 line-clamp-2">
                            {candidate.bio}
                          </p>
                        )}
                        {candidate.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.skills.split(',').slice(0, 5).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-block bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded dark:bg-gray-700 dark:text-gray-300"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-bodydark2">
                          Joined: {new Date(candidate.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}