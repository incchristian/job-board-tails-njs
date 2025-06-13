"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

interface Contact {
  id: number;
  contactId: number;
  name: string;
  email: string;
  userClass: string;
  company?: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
}

export default function ContactsPage() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session) {
      fetchContacts();
    }
  }, [session]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts/accepted');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!session) {
    return (
      <DefaultLayout>
        <div className="text-center py-8">Please log in to view your contacts.</div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="My Contacts" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              My Professional Contacts
            </h4>
            <p className="text-sm text-bodydark2 mt-1">
              {session.user.userClass === 'employer' 
                ? 'Recruiters you\'re connected with' 
                : 'Employers you\'re connected with'
              }
            </p>
          </div>
          
          {/* Search */}
          <div className="relative mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded border border-stroke bg-transparent py-2 pl-10 pr-4 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.25 3C5.48858 3 3.25 5.23858 3.25 8C3.25 10.7614 5.48858 13 8.25 13C10.9114 13 13.25 10.7614 13.25 8C13.25 5.23858 10.9114 3 8.25 3ZM1.25 8C1.25 4.13401 4.38401 1 8.25 1C12.116 1 15.25 4.13401 15.25 8C15.25 12.066 12.116 15 8.25 15C4.38401 15 1.25 12.066 1.25 8Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.4857 11.4857C11.8762 11.0952 12.5095 11.0952 12.9 11.4857L16.7071 15.2929C17.0976 15.6834 17.0976 16.3166 16.7071 16.7071C16.3166 17.0976 15.6834 17.0976 15.2929 16.7071L11.4857 12.9C11.0952 12.5095 11.0952 11.8762 11.4857 11.4857Z"
                fill=""
              />
            </svg>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-bodydark2">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black dark:text-white mb-1">No contacts yet</h3>
            <p className="text-bodydark2">
              {searchTerm 
                ? 'No contacts match your search.' 
                : 'Start building your professional network by connecting with others.'
              }
            </p>
          </div>
        ) : (
          /* Contacts Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-lg transition-shadow"
              >
                {/* Profile Section */}
                <div className="flex items-center mb-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={contact.profilePicture || '/images/user/user-06.png'}
                      alt={contact.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <h5 className="text-lg font-medium text-black dark:text-white">
                      {contact.name}
                    </h5>
                    <p className="text-sm text-bodydark2 capitalize">
                      {contact.userClass}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <svg className="w-4 h-4 mr-2 text-bodydark2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-bodydark2">{contact.email}</span>
                  </div>
                  
                  {contact.company && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-bodydark2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-6a1 1 0 00-1-1H9a1 1 0 00-1 1v6a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 8a1 1 0 011-1h4a1 1 0 011 1v4H7v-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-bodydark2">{contact.company}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {contact.bio && (
                  <p className="text-sm text-bodydark2 mb-4 line-clamp-3">
                    {contact.bio}
                  </p>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-stroke dark:border-strokedark">
                  <span className="text-xs text-bodydark2">
                    Connected {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/profile/${contact.contactId}`}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary rounded hover:bg-primary-dark transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}