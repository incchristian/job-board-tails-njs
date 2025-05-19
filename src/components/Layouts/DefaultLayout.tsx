"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useProfile } from "@/context/ProfileContext";

const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userClass } = useProfile();

  // Debug: Log the userClass to verify its value
  console.log("DefaultLayout - userClass:", userClass);

  // Show Sidebar only for admin users
  const showSidebar = userClass === "admin";

  return (
    <div className="flex min-h-screen w-full">
      {showSidebar && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}
      <div className="flex flex-1 flex-col w-full">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;