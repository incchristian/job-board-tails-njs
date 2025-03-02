'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface ProfileContextType {
  profilePic: string;
  setProfilePic: (pic: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profilePic, setProfilePic] = useState('/images/user/user-03.png');

  return (
    <ProfileContext.Provider value={{ profilePic, setProfilePic }}>
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