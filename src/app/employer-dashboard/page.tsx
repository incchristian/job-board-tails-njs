"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

interface Assignment {
  id: string;
  recruiterName: string;
  recruiterEmail: string;
  jobTitle: string;
  jobId: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function EmployerDashboard() {
  const { data: session } = useSession();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    if (session?.user?.userClass === 'Employer') {
      fetchAssignments();
    }
  }, [session]);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/job-assignments');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Type of data:', typeof data);
        console.log('Data keys:', Object.keys(data));
        
        // The API should return { assignments: [...] }
        const assignmentsArray = data.assignments || [];
        console.log('Assignments array:', assignmentsArray);
        console.log('Number of assignments:', assignmentsArray.length);
        setAssignments(assignmentsArray);
      } else {
        console.error('API Error:', response.status, response.statusText);
        // Let's also log the response text to see what error we're getting
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch('/api/job-assignments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          status: 'completed'
        }),
      });
      if (response.ok) {
        fetchAssignments(); // Refresh the list
      }
    } catch (error) {
      console.error('Error completing assignment:', error);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    accepted: assignments.filter(a => a.status === 'accepted').length,
    declined: assignments.filter(a => a.status === 'declined').length,
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-title-md2 font-semibold text-black dark:text-white mb-2">
            Employer Dashboard
          </h1>
          <p className="text-body">
            Manage your recruited assignments and track progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-8">
          <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <svg className="fill-primary dark:fill-white" width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z" fill=""/>
                <path d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z" fill=""/>
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.total}
                </h4>
                <span className="text-sm font-medium">Total Assignments</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99378 21.3813 3.85316 21.3813H18.1469C19.0063 21.3813 19.8 21.0375 20.3844 20.3844C20.9688 19.7313 21.2438 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.1469 19.8344H3.85316C3.4375 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2157L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.3969C17.1532 2.16563 17.7719 2.71563 17.8407 3.43751L19.525 18.2157C19.5938 18.6313 19.4907 19.0438 19.2157 19.3531Z" fill=""/>
                <path d="M14.3906 7.67504C14.3906 6.4969 13.4969 5.60317 12.3188 5.60317H9.68127C8.50315 5.60317 7.60939 6.4969 7.60939 7.67504C7.60939 8.85317 8.50315 9.7469 9.68127 9.7469H12.3188C13.4969 9.7469 14.3906 8.85317 14.3906 7.67504Z" fill=""/>
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.pending}
                </h4>
                <span className="text-sm font-medium">Pending</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <svg className="fill-primary dark:fill-white" width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.7531 16.4312C10.3781 16.4312 9.27808 15.3312 9.27808 13.9562C9.27808 12.5812 10.3781 11.4812 11.7531 11.4812C13.1281 11.4812 14.2281 12.5812 14.2281 13.9562C14.2281 15.3312 13.1281 16.4312 11.7531 16.4312ZM11.7531 12.7875C11.0968 12.7875 10.5843 13.3 10.5843 13.9562C10.5843 14.6125 11.0968 15.125 11.7531 15.125C12.4093 15.125 12.9218 14.6125 12.9218 13.9562C12.9218 13.3 12.4093 12.7875 11.7531 12.7875Z" fill=""/>
                <path d="M11.7531 7.26874C10.3781 7.26874 9.27808 6.16874 9.27808 4.79374C9.27808 3.41874 10.3781 2.31874 11.7531 2.31874C13.1281 2.31874 14.2281 3.41874 14.2281 4.79374C14.2281 6.16874 13.1281 7.26874 11.7531 7.26874ZM11.7531 3.625C11.0968 3.625 10.5843 4.1375 10.5843 4.79374C10.5843 5.44999 11.0968 5.9625 11.7531 5.9625C12.4093 5.9625 12.9218 5.44999 12.9218 4.79374C12.9218 4.1375 12.4093 3.625 11.7531 3.625Z" fill=""/>
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.accepted}
                </h4>
                <span className="text-sm font-medium">Accepted</span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <svg className="fill-primary dark:fill-white" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z" fill=""/>
                <path d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z" fill=""/>
              </svg>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <h4 className="text-title-md font-bold text-black dark:text-white">
                  {stats.declined}
                </h4>
                <span className="text-sm font-medium">Declined</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'pending', 'accepted', 'declined'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-boxdark dark:text-white dark:border-strokedark'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Assignments Table */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="px-4 py-6 md:px-6 xl:px-7.5">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Recruiter Assignments
            </h4>
          </div>

          <div className="grid grid-cols-5 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5">
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Recruiter</p>
            </div>
            <div className="col-span-2 hidden items-center sm:flex">
              <p className="font-medium">Job</p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="font-medium">Status</p>
            </div>
            <div className="col-span-2 flex items-center">
              <p className="font-medium">Actions</p>
            </div>
          </div>

          {filteredAssignments.map((assignment) => (
            <div
              className="grid grid-cols-5 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5"
              key={assignment.id}
            >
              <div className="col-span-2 flex items-center">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="h-12.5 w-15 rounded-md">
                    <Image
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${assignment.recruiterName}`}
                      width={60}
                      height={50}
                      alt="Recruiter"
                      className="rounded-md"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-black dark:text-white">
                      {assignment.recruiterName}
                    </p>
                    <p className="text-xs text-meta-3">
                      {assignment.recruiterEmail}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 hidden items-center sm:flex">
                <p className="text-sm text-black dark:text-white">
                  {assignment.jobTitle}
                </p>
              </div>
              <div className="col-span-1 flex items-center">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    assignment.status === 'accepted'
                      ? 'bg-success bg-opacity-10 text-success'
                      : assignment.status === 'pending'
                      ? 'bg-warning bg-opacity-10 text-warning'
                      : 'bg-danger bg-opacity-10 text-danger'
                  }`}
                >
                  {assignment.status}
                </span>
              </div>
              <div className="col-span-2 flex items-center space-x-3.5">
                {assignment.status !== 'declined' && (
                  <button
                    onClick={() => handleCompleteAssignment(assignment.id)}
                    className="hover:text-primary"
                    title="Mark as Complete"
                  >
                    <svg
                      className="fill-current"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.1999 2.39998H11.5999C10.6999 2.39998 9.89988 3.19998 9.89988 4.09998V6.49998C9.89988 6.89998 10.1999 7.19998 10.5999 7.19998C10.9999 7.19998 11.2999 6.89998 11.2999 6.49998V4.09998C11.2999 3.99998 11.3999 3.89998 11.5999 3.89998H16.1999C16.9999 3.89998 17.5999 4.49998 17.5999 5.29998V14.6999C17.5999 15.4999 16.9999 16.0999 16.1999 16.0999H11.5999C11.3999 16.0999 11.2999 15.9999 11.2999 15.7999V13.3999C11.2999 12.9999 10.9999 12.6999 10.5999 12.6999C10.1999 12.6999 9.89988 12.9999 9.89988 13.3999V15.7999C9.89988 16.6999 10.6999 17.4999 11.5999 17.4999H16.1999C17.8999 17.4999 19.2999 16.0999 19.2999 14.3999V5.69998C19.2999 3.99998 17.8999 2.39998 16.1999 2.39998Z"
                        fill=""
                      />
                      <path
                        d="M6.39988 10.7999H12.1999C12.5999 10.7999 12.8999 10.4999 12.8999 10.0999C12.8999 9.69988 12.5999 9.39988 12.1999 9.39988H6.39988L8.29988 7.49988C8.59988 7.19988 8.59988 6.69988 8.29988 6.39988C7.99988 6.09988 7.49988 6.09988 7.19988 6.39988L4.19988 9.39988C3.89988 9.69988 3.89988 10.1999 4.19988 10.4999L7.19988 13.4999C7.29988 13.5999 7.49988 13.6999 7.69988 13.6999C7.89988 13.6999 8.09988 13.5999 8.19988 13.4999C8.49988 13.1999 8.49988 12.6999 8.19988 12.3999L6.39988 10.7999Z"
                        fill=""
                      />
                    </svg>
                  </button>
                )}
                
                <Link
                  href={`/jobs/${assignment.jobId}`}
                  className="hover:text-primary"
                  title="View Job"
                >
                  <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.2562 8.99981 13.2562C13.1061 13.2562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.74374 8.99981 4.74374C4.89356 4.74374 2.4748 7.95936 1.85605 8.99999Z"
                      fill=""
                    />
                    <path
                      d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                      fill=""
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}

          {filteredAssignments.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-body">No assignments found.</p>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}