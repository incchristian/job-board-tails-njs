"use client";
import React, { useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface DefaultLayoutProps {
  children: ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();

  console.log("DefaultLayout - userClass:", session?.user?.userClass);

  // Check if user is admin - only admins see the sidebar
  const isAdmin = session?.user?.userClass === "admin";

  // Check if user is employer or recruiter
  const isEmployerOrRecruiter =
    session?.user?.userClass === "employer" ||
    session?.user?.userClass === "recruiter";

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        {/* Only show sidebar for admin users */}
        {isAdmin && (
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            userClass={session?.user?.userClass}
            isEmployerOrRecruiter={isEmployerOrRecruiter}
          />
        )}

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            session={session}
            isAdmin={isAdmin}
          />

          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;