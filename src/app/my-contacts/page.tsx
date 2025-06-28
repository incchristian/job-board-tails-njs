"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

export default function MyContactsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    const fetchContacts = async () => {
      try {
        const response = await fetch("/api/contacts/accepted");
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to load contacts");
        }
      } catch (err) {
        setError("Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [session, status, router]);

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading contacts...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl">
        <Breadcrumb pageName="My Contacts" />

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              My Contacts ({contacts.length})
            </h3>
            <p className="text-bodydark2 mt-1">
              {session?.user?.userClass === "Employer" 
                ? "Recruiters who have accepted your contact requests"
                : "Employers who you have connections with"
              }
            </p>
          </div>

          <div className="p-7">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {error}
              </div>
            )}

            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                  No contacts yet
                </h3>
                <p className="text-bodydark2 mb-4">
                  {session?.user?.userClass === "Employer"
                    ? "You haven't added any recruiters to your contacts yet."
                    : "You don't have any employer connections yet."
                  }
                </p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                >
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contacts.map((contact) => (
                  <div
                    key={contact.contactId}
                    className="border border-stroke dark:border-strokedark rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium text-lg">
                            {contact.name?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-black dark:text-white mb-1 truncate">
                          {contact.name}
                        </h4>
                        <p className="text-bodydark2 text-sm mb-2 flex items-center gap-1">
                          📧 <span className="truncate">{contact.email}</span>
                        </p>
                        <p className="text-bodydark2 text-sm mb-3 flex items-center gap-1">
                          👤 <span>{contact.userClass}</span>
                        </p>
                        {contact.company && (
                          <p className="text-bodydark2 text-sm mb-3 flex items-center gap-1">
                            🏢 <span className="truncate">{contact.company}</span>
                          </p>
                        )}
                        <p className="text-xs text-bodydark2">
                          Connected: {new Date(contact.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stroke dark:border-strokedark">
                      <div className="flex gap-2">
                        <Link
                          href={`/messages?contact=${contact.contactId}`}
                          className="flex-1 text-center rounded bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                        >
                          Message
                        </Link>
                        {session?.user?.userClass === "Employer" && (
                          <Link
                            href={`/profile/${contact.contactId}`}
                            className="flex-1 text-center rounded bg-bodydark px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                          >
                            View Profile
                          </Link>
                        )}
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