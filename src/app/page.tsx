"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ECommerce from "@/components/Dashboard/E-commerce";
import React from 'react';
import SimpleLayout from "@/components/Layouts/SimpleLayout";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Replace this with your actual authentication logic
    const isAuthenticated = false; // Example: check if user is authenticated
    if (!isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [router]);

  return (
    <SimpleLayout>
      <ECommerce />
    </SimpleLayout>
  );
}