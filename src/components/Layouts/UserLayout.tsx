/UserLayout.tsx
"use client";
import React from "react";
import Header from "@/components/Header";
import SessionDebug from "@/components/Debug/SessionDebug";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header 
          sidebarOpen={false} 
          setSidebarOpen={() => {}}
          showSidebarToggle={false}
        />
        <main className="flex-1">
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
      <SessionDebug />
    </>
  );
}