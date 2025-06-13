"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

const DropdownUser = ({ profilePic }: { profilePic: string }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();

  const userName = session?.user?.name || "Thomas Anree";
  const userClass = session?.user?.userClass || "Candidate";

  return (
    <div className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {userName}
          </span>
          <span className="block text-xs">{userClass}</span>
        </span>
        <span className="h-12 w-12 rounded-full">
          <Image
            width={112}
            height={112}
            src={profilePic}
            style={{ width: "auto", height: "auto" }}
            alt="User"
          />
        </span>
        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.41 0.91a0.71 0.71 0 011 0L6 5.32l4.59-4.41a0.71 0.71 0 011 1L6.59 7a0.71 0.71 0 01-1 0L0.41 2.09a0.71 0.71 0 010-1z"
          />
        </svg>
      </Link>

      <div
        className={`absolute right-0 mt-4 w-62.5 flex flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen ? "block" : "hidden"
        }`}
      >
        <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
          <li>
            <Link
              href="/jobs"
              className="flex items-center gap-3.5 text-sm font-medium hover:text-primary"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
              >
                <circle cx="11" cy="5" r="4" />
                <path d="M4 17a7 7 0 0114 0v3H4v-3z" />
              </svg>
              Browse Jobs
            </Link>
          </li>
          {userClass !== "Candidate" && (
            <>
              <li>
                <Link
                  href="/jobs/post"
                  className="flex items-center gap-3.5 text-sm font-medium hover:text-primary"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                  >
                    <path d="M11 6v5H6v2h5v5h2v-5h5v-2h-5V6z" />
                  </svg>
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/my-jobs"
                  className="flex items-center gap-3.5 text-sm font-medium hover:text-primary"
                >
                  <svg
                    className="fill-current"
                    width="22"
                    height="22"
                    viewBox="0 0 22 22"
                  >
                    <rect
                      x="4"
                      y="2"
                      width="14"
                      height="18"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <path d="M7 6h8M7 10h8M7 14h8" />
                  </svg>
                  Edit My Jobs
                </Link>
              </li>
            </>
          )}

          {/* Add My Contacts - only for employers and recruiters */}
          {(userClass === "employer" || userClass === "recruiter") && (
            <li>
              <Link
                href="/contacts"
                className="flex items-center gap-3.5 text-sm font-medium hover:text-primary"
              >
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                >
                  <path d="M16 4a4 4 0 11-8 0 4 4 0 018 0zM23 20c0 2-1 4-3 4H2c-2 0-3-2-3-4 0-5.33 4.67-8 11-8s11 2.67 11 8z" />
                  <path d="M19 8a3 3 0 11-6 0 3 3 0 016 0zM21 19c-.33-3.33-3-5-7-5-.86 0-1.67.1-2.4.29 1.44.9 2.4 2.43 2.4 4.21v.5h7z" />
                </svg>
                My Contacts
              </Link>
            </li>
          )}

          <li>
            <Link
              href="/profile"
              className="flex items-center gap-3.5 text-sm font-medium hover:text-primary"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
              >
                <circle cx="11" cy="5" r="4" />
                <path d="M4 17a7 7 0 0114 0v3H4v-3z" />
              </svg>
              My Profile
            </Link>
          </li>
          <li>
            <Link
              href="/profile/edit"
              className="flex items-center gap-3.5 text-sm font-medium hover:text-primary"
            >
              <svg
                className="fill-current"
                width="22"
                height="22"
                viewBox="0 0 22 22"
              >
                <path d="M15 2L5 12l3 3L18 5l-3-3zM4 13v5h5l-1-1-3-3z" />
              </svg>
              Edit My Profile
            </Link>
          </li>
        </ul>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium hover:text-primary"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
          >
            <path d="M15 2H11v2h4v14h-4v2h4a2 2 0 002-2V4a2 2 0 00-2-2z" />
            <path d="M7 15l-4-4 4-4 1 1-3 3h8v2H5l3 3-1 1z" />
          </svg>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default DropdownUser;