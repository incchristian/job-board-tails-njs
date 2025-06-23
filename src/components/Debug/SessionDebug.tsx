"use client";

import { useSession } from "next-auth/react";

export default function SessionDebug() {
  const { data: session, status } = useSession();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      <div>Status: {status}</div>
      <div>Session: {session ? 'YES' : 'NO'}</div>
      <div>User: {session?.user?.name || 'None'}</div>
      <div>Type: {session?.user?.userClass || 'None'}</div>
    </div>
  );
}

// In your DefaultLayout or main layout
import SessionDebug from "@/components/Debug/SessionDebug";

// Add this somewhere in your JSX
<SessionDebug />