"use client";

import React, { useState, ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Script from "next/script";
import Chatbot from "@/components/Chatbot";
import { FaTimes } from "react-icons/fa";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const GrokIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#ffffff" />
      <path
        d="M6 18L18 6"
        stroke="#000000"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker`}
        strategy="lazyOnload"
        onLoad={() => console.log("Global Google Maps API loaded")}
        onError={(e) => console.error("Failed to load Google Maps API:", e)}
      />
      <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 dark:text-white text-gray-800">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="fixed bottom-8 right-8 z-[200] flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition-transform hover:scale-110 hover:bg-blue-500"
            aria-label="Toggle Chat"
          >
            {chatOpen ? <FaTimes size={24} /> : <GrokIcon />}
          </button>
          {chatOpen && (
            <div className="fixed bottom-24 right-8 z-[200] w-80 rounded-3xl md:w-96 transition-opacity duration-300 opacity-100">
              <Chatbot />
            </div>
          )}
        </div>
      </div>
    </>
  );
}