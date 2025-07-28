"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import ClickOutside from "@/components/ClickOutside";

const DropdownUser = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  if (!session) return null;

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <Link
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4"
        href="#"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {session.user?.name || "User"}
          </span>
          <span className="block text-xs">
            {session.user?.userClass || "Guest"}
          </span>
        </span>

        <span className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-black font-medium">
            {session.user?.name?.charAt(0).toUpperCase() || "U"}       
          </span>
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"  
            fill=""
          />
        </svg>
      </Link>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <Link
                href="/profile"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                onClick={() => setDropdownOpen(false)}
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
                    d="M9.0002 7.79065C11.0814 7.79065 12.7689 6.1594 12.7689 4.1344C12.7689 2.1094 11.0814 0.478149 9.0002 0.478149C6.91895 0.478149 5.23145 2.1094 5.23145 4.1344C5.23145 6.1594 6.91895 7.79065 9.0002 7.79065ZM9.0002 1.7969C10.3783 1.7969 11.4502 2.84065 11.4502 4.16252C11.4502 5.4844 10.3783 6.52815 9.0002 6.52815C7.62207 6.52815 6.55020 5.4844 6.55020 4.16252C6.55020 2.84065 7.62207 1.7969 9.0002 1.7969Z"
                    fill=""
                  />
                  <path
                    d="M10.8283 9.05627H7.17207C4.16269 9.05627 1.71582 11.5313 1.71582 14.5406V16.875C1.71582 17.2125 1.99707 17.5219 2.3627 17.5219C2.72832 17.5219 3.00957 17.2407 3.00957 16.875V14.5406C3.00957 12.2344 4.89394 10.3219 7.22832 10.3219H10.8564C13.1627 10.3219 15.0752 12.2063 15.0752 14.5406V16.875C15.0752 17.2125 15.3564 17.5219 15.7221 17.5219C16.0877 17.5219 16.3689 17.2407 16.3689 16.875V14.5406C16.2846 11.5313 13.8377 9.05627 10.8283 9.05627Z"
                    fill=""
                  />
                </svg>
                My Profile
              </Link>
            </li>

            {/* Browse All Jobs - show for ALL user types */}
            <li>
              <Link
                href="/jobs"
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                onClick={() => setDropdownOpen(false)}
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
                    d="M15.7499 2.9812H14.2874V2.36245C14.2874 2.02495 14.0062 1.71558 13.6405 1.71558C13.2749 1.71558 12.9937 1.99683 12.9937 2.36245V2.9812H4.97803V2.36245C4.97803 2.02495 4.69678 1.71558 4.33115 1.71558C3.96553 1.71558 3.68428 1.99683 3.68428 2.36245V2.9812H2.2499C1.29365 2.9812 0.478027 3.7687 0.478027 4.75308V14.5406C0.478027 15.4968 1.26553 16.3125 2.2499 16.3125H15.7499C16.7062 16.3125 17.5218 15.525 17.5218 14.5406V4.72495C17.5218 3.7687 16.7062 2.9812 15.7499 2.9812Z"
                    fill=""
                  />
                </svg>
                Browse All Jobs
              </Link>
            </li>

            {/* Show different menu items based on user type */}       
            {session.user.userClass === "Employer" && (
              <>
                {/* ADD EMPLOYER DASHBOARD HERE */}
                <li>
                  <Link
                    href="/employer-dashboard"
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"        
                    onClick={() => setDropdownOpen(false)}
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
                        d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299ZM6.10322 6.84942H2.53135C2.06447 6.84942 1.65322 6.4969 1.65322 6.02192V2.70005C1.65322 2.22817 2.01885 1.84942 2.53135 1.84942H6.10322C6.5751 1.84942 6.98135 2.20192 6.98135 2.70005V6.27192C6.9376 6.74692 6.57197 6.84942 6.10322 6.84942Z"
                        fill=""
                      />
                      <path
                        d="M15.4689 0.956299H11.8971C10.9408 0.956299 10.1533 1.7438 10.1533 2.70005V6.27192C10.1533 7.22817 10.9408 8.01567 11.8971 8.01567H15.4689C16.4252 8.01567 17.2127 7.22817 17.2127 6.27192V2.72817C17.2408 1.7438 16.4533 0.956299 15.4689 0.956299ZM15.4689 6.84942H11.8971C11.4302 6.84942 11.0189 6.4969 11.0189 6.02192V2.70005C11.0189 2.22817 11.3846 1.84942 11.8971 1.84942H15.4689C15.9408 1.84942 16.3471 2.20192 16.3471 2.70005V6.27192C16.3033 6.74692 15.9377 6.84942 15.4689 6.84942Z"
                        fill=""
                      />
                      <path
                        d="M6.10322 10.0844H2.53135C1.5751 10.0844 0.787598 10.8719 0.787598 11.8281V15.4C0.787598 16.3562 1.5751 17.1437 2.53135 17.1437H6.10322C7.05947 17.1437 7.84697 16.3562 7.84697 15.4V11.8562C7.8751 10.8719 7.0876 10.0844 6.10322 10.0844ZM6.10322 15.9781H2.53135C2.06447 15.9781 1.65322 15.6256 1.65322 15.1506V11.8287C1.65322 11.3569 2.01885 10.9781 2.53135 10.9781H6.10322C6.5751 10.9781 6.98135 11.3306 6.98135 11.8287V15.4006C6.9376 15.8756 6.57197 15.9781 6.10322 15.9781Z"
                        fill=""
                      />
                      <path
                        d="M15.4689 10.0844H11.8971C10.9408 10.0844 10.1533 10.8719 10.1533 11.8281V15.4C10.1533 16.3562 10.9408 17.1437 11.8971 17.1437H15.4689C16.4252 17.1437 17.2127 16.3562 17.2127 15.4V11.8562C17.2408 10.8719 16.4533 10.0844 15.4689 10.0844ZM15.4689 15.9781H11.8971C11.4302 15.9781 11.0189 15.6256 11.0189 15.1506V11.8287C11.0189 11.3569 11.3846 10.9781 11.8971 10.9781H15.4689C15.9408 10.9781 16.3471 11.3306 16.3471 11.8287V15.4006C16.3033 15.8756 15.9377 15.9781 15.4689 15.9781Z"
                        fill=""
                      />
                    </svg>
                    Employer Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-jobs"
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"        
                    onClick={() => setDropdownOpen(false)}
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
                        d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299Z"
                        fill=""
                      />
                    </svg>
                    My Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-contacts"
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"        
                    onClick={() => setDropdownOpen(false)}
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
                        d="M9.0002 15.75C7.59395 15.75 6.1877 15.1875 5.12207 14.1219C3.01582 12.0156 3.01582 8.48438 5.12207 6.37813C7.22832 4.27188 10.7596 4.27188 12.8658 6.37813C14.9721 8.48438 14.9721 12.0156 12.8658 14.1219C11.8002 15.1875 10.3939 15.75 9.0002 15.75ZM9.0002 5.25C8.04395 5.25 7.08770 5.61563 6.37207 6.33125C4.94082 7.7625 4.94082 10.2375 6.37207 11.6688C7.80332 13.1 10.2783 13.1 11.7096 11.6688C13.1408 10.2375 13.1408 7.7625 11.7096 6.33125C10.9939 5.61563 10.0377 5.25 9.0002 5.25Z"
                        fill=""
                      />
                      <path
                        d="M15.7502 17.25H2.2502C1.8377 17.25 1.5002 16.9125 1.5002 16.5C1.5002 16.0875 1.8377 15.75 2.2502 15.75H15.7502C16.1627 15.75 16.5002 16.0875 16.5002 16.5C16.5002 16.9125 16.1627 17.25 15.7502 17.25Z"
                        fill=""
                      />
                    </svg>
                    My Contacts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/jobs/post"
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"        
                    onClick={() => setDropdownOpen(false)}
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
                        d="M9.0002 1.5C4.8577 1.5 1.5002 4.8575 1.5002 9C1.5002 13.1425 4.8577 16.5 9.0002 16.5C13.1427 16.5 16.5002 13.1425 16.5002 9C16.5002 4.8575 13.1427 1.5 9.0002 1.5ZM13.5002 9.75H9.7502V13.5C9.7502 13.9125 9.4127 14.25 9.0002 14.25C8.5877 14.25 8.2502 13.9125 8.2502 13.5V9.75H4.5002C4.0877 9.75 3.7502 9.4125 3.7502 9C3.7502 8.5875 4.0877 8.25 4.5002 8.25H8.2502V4.5C8.2502 4.0875 8.5877 3.75 9.0002 3.75C9.4127 3.75 9.7502 4.0875 9.7502 4.5V8.25H13.5002C13.9127 8.25 14.2502 8.5875 14.2502 9C14.2502 9.4125 13.9127 9.75 13.5002 9.75Z"        
                        fill=""
                      />
                    </svg>
                    Post New Job
                  </Link>
                </li>
              </>
            )}

            {/* Show recruiter-specific menu items */}
            {session.user.userClass === "Recruiter" && (
              <>
                <li>
                  <Link
                    href="/recruiter-dashboard"
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"        
                    onClick={() => setDropdownOpen(false)}
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
                        d="M6.10322 0.956299H2.53135C1.5751 0.956299 0.787598 1.7438 0.787598 2.70005V6.27192C0.787598 7.22817 1.5751 8.01567 2.53135 8.01567H6.10322C7.05947 8.01567 7.84697 7.22817 7.84697 6.27192V2.72817C7.8751 1.7438 7.0876 0.956299 6.10322 0.956299Z"
                        fill=""
                      />
                    </svg>
                    My Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/my-contacts"
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"        
                    onClick={() => setDropdownOpen(false)}
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
                        d="M9.0002 15.75C7.59395 15.75 6.1877 15.1875 5.12207 14.1219C3.01582 12.0156 3.01582 8.48438 5.12207 6.37813C7.22832 4.27188 10.7596 4.27188 12.8658 6.37813C14.9721 8.48438 14.9721 12.0156 12.8658 14.1219C11.8002 15.1875 10.3939 15.75 9.0002 15.75ZM9.0002 5.25C8.04395 5.25 7.08770 5.61563 6.37207 6.33125C4.94082 7.7625 4.94082 10.2375 6.37207 11.6688C7.80332 13.1 10.2783 13.1 11.7096 11.6688C13.1408 10.2375 13.1408 7.7625 11.7096 6.33125C10.9939 5.61563 10.0377 5.25 9.0002 5.25Z"
                        fill=""
                      />
                      <path
                        d="M15.7502 17.25H2.2502C1.8377 17.25 1.5002 16.9125 1.5002 16.5C1.5002 16.0875 1.8377 15.75 2.2502 15.75H15.7502C16.1627 15.75 16.5002 16.0875 16.5002 16.5C16.5002 16.9125 16.1627 17.25 15.7502 17.25Z"
                        fill=""
                      />
                    </svg>
                    My Contacts
                  </Link>
                </li>
              </>
            )}

            {session.user.userClass === "JobSeeker" && (
              <li>
                <Link
                  href="/my-applications"
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                  onClick={() => setDropdownOpen(false)}
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
                      d="M15.7499 2.9812H14.2874V2.36245C14.2874 2.02495 14.0062 1.71558 13.6405 1.71558Z"
                      fill=""
                    />
                  </svg>
                  My Applications
                </Link>
              </li>
            )}
          </ul>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"      
          >
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.5156 5.05312 11.5156 4.64062V2.23437C11.5156 2.16562 11.5844 2.09687 11.6531 2.09687H15.5375C16.3625 2.09687 17.0156 2.75 17.0156 3.575V18.425C17.0156 19.25 16.3625 19.9031 15.5375 19.9031H11.6531C11.5844 19.9031 11.5156 19.8344 11.5156 19.7656V17.3594C11.5156 16.9469 11.1719 16.6031 10.7594 16.6031C10.3469 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5844 20.0187 18.5844 18.3344V3.60937C18.5844 1.925 17.2219 0.618744 15.5375 0.618744Z"
                fill=""
              />
              <path
                d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25626 15.2313 7.45939 15.3094 7.66251 15.3094C7.86564 15.3094 8.06876 15.2313 8.20939 15.0906C8.51876 14.7813 8.51876 14.3 8.20939 13.9906L6.05001 11.7563Z"      
                fill=""
              />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.userClass !== "Employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ...rest of the code...
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}