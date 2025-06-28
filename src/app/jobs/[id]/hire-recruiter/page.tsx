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
  const [contactRecruiters, setContactRecruiters] = useState([]);
  const [suggestedRecruiters, setSuggestedRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(null);
  const [addingContact, setAddingContact] = useState(null);
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

        // Fetch contacts (trusted recruiters)
        const contactsResponse = await fetch("/api/contacts/accepted");
        let contacts = [];
        if (contactsResponse.ok) {
          const contactsData = await contactsResponse.json();
          // Filter only recruiters from contacts
          contacts = contactsData.contacts.filter(contact => 
            contact.userClass.toLowerCase() === 'recruiter'
          );
          setContactRecruiters(contacts);
        } else {
          console.warn("Failed to load contacts:", contactsResponse.status);
        }

        // Fetch all recruiters (optional - don't fail if this doesn't work)
        try {
          const recruitersResponse = await fetch("/api/recruiters");
          if (recruitersResponse.ok) {
            const allRecruiters = await recruitersResponse.json();
            // Filter out recruiters that are already in contacts
            const contactIds = contacts.map(contact => contact.contactId);
            const suggested = allRecruiters.filter(recruiter => 
              !contactIds.includes(recruiter.id)
            );
            setSuggestedRecruiters(suggested);
          } else {
            console.warn("Failed to load suggested recruiters:", recruitersResponse.status);
            // Don't set error - just log warning
            setSuggestedRecruiters([]);
          }
        } catch (recruitersError) {
          console.warn("Error fetching suggested recruiters:", recruitersError);
          setSuggestedRecruiters([]);
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Failed to load job details");
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
      // Change this line - remove '/hire-recruiter' from the URL
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recruiterId,
          action: 'hire-recruiter'
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

  const handleAddToContacts = async (recruiterId) => {
    setAddingContact(recruiterId);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recruiterId }),
      });

      if (response.ok) {
        setMessage("Contact request sent!");
        // Move recruiter from suggested to contacts section after accepting
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add contact");
      }
    } catch (err) {
      setError("Failed to add contact");
    } finally {
      setAddingContact(null);
    }
  };

  const RecruiterCard = ({ recruiter, isContact = false }) => (
    <div
      className={`border rounded-lg p-6 ${
        isContact 
          ? "border-primary bg-primary/5 dark:bg-primary/10" 
          : "border-stroke dark:border-strokedark"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-black dark:text-white">
              {recruiter.name}
            </h4>
            {isContact && (
              <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
                Trusted Contact
              </span>
            )}
          </div>
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
      
      <div className="flex gap-2">
        <button
          onClick={() => handleHireRecruiter(isContact ? recruiter.contactId : recruiter.id)}
          disabled={hiring === (isContact ? recruiter.contactId : recruiter.id)}
          className="flex-1 flex justify-center rounded bg-primary px-4 py-3 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
        >
          {hiring === (isContact ? recruiter.contactId : recruiter.id) ? "Hiring..." : "Hire This Recruiter"}
        </button>
        
        {!isContact && (
          <button
            onClick={() => handleAddToContacts(recruiter.id)}
            disabled={addingContact === recruiter.id}
            className="px-4 py-3 rounded border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
          >
            {addingContact === recruiter.id ? "Adding..." : "Add to Contacts"}
          </button>
        )}
      </div>
    </div>
  );

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
      <div className="mx-auto max-w-6xl">
        <Breadcrumb pageName="Hire a Recruiter" />
        
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">
              Job: {job?.title}
            </h3>
            <p className="text-bodydark2 mt-1">📍 {job?.location}</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Your Contacts Section */}
        {contactRecruiters.length > 0 && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
            <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                Your Trusted Recruiters ({contactRecruiters.length})
              </h3>
              <p className="text-bodydark2 mt-1">
                Recruiters you've connected with and trust
              </p>
            </div>
            
            <div className="p-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactRecruiters.map((recruiter) => (
                  <RecruiterCard 
                    key={recruiter.contactId} 
                    recruiter={recruiter} 
                    isContact={true} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Recruiters Section */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-bodydark2 rounded-full"></span>
              Suggested Recruiters ({suggestedRecruiters.length})
            </h3>
            <p className="text-bodydark2 mt-1">
              Other available recruiters you can hire
            </p>
          </div>
          
          <div className="p-7">
            {suggestedRecruiters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-bodydark2">
                  {contactRecruiters.length > 0 
                    ? "All available recruiters are already in your contacts!" 
                    : "No recruiters available at the moment."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedRecruiters.map((recruiter) => (
                  <RecruiterCard 
                    key={recruiter.id} 
                    recruiter={recruiter} 
                    isContact={false} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={`/jobs/${params.id}`}
            className="inline-flex items-center justify-center rounded bg-bodydark px-6 py-3 font-medium text-white hover:bg-opacity-90"
          >
            ← Back to Job Details
          </Link>
        </div>
      </div>
    </DefaultLayout>
  );
}