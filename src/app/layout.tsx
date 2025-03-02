"use client";

import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "nouislider/dist/nouislider.css";
import "dropzone/dist/dropzone.css";
import "@/css/satoshi.css";
import "@/css/simple-datatables.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ProfileProvider } from "@/context/ProfileContext"; // Add this import
import Loader from "@/components/common/Loader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <SessionProvider>
          <ProfileProvider> {/* Wrap children with ProfileProvider */}
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              {loading ? <Loader /> : children}
            </div>
          </ProfileProvider>
        </SessionProvider>
      </body>
    </html>
  );
}