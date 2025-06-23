"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

// Load the dashboard component dynamically to prevent SSR issues
const ECommerce = dynamic(() => import("@/components/Dashboard/E-commerce"), {
  ssr: false,
  loading: () => <div className="p-8">Loading dashboard...</div>
});

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no session, redirect to sign in
    if (status !== "loading" && !session) {
      router.push("/api/auth/signin");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-bodydark2">Loading...</p>
        </div>
      </div>
    );
  }

  // If no session, show nothing (redirect is happening)
  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-bodydark2">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  return (
    <DefaultLayout>
      <ECommerce />
    </DefaultLayout>
  );
}