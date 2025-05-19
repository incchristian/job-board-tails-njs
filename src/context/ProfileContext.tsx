'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ProfileContextType {
  profilePic: string;
  setProfilePic: (pic: string) => void;
  userClass: 'admin' | 'user' | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profilePic, setProfilePic] = useState('/images/user/user-03.png');
  const { data: session } = useSession();
  
  const userClass = session?.user?.userClass as 'admin' | 'user' | null;

  // Debug: Log when no session is found
  useEffect(() => {
    if (!session) {
      console.log('No session found in ProfileProvider');
    } else {
      console.log('Session found with userClass:', userClass);
    }
  }, [session, userClass]);

  return (
    <ProfileContext.Provider value={{ profilePic, setProfilePic, userClass }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
  }