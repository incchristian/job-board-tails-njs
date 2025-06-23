import { signOut } from "next-auth/react";

export const forceLogout = async () => {
  // Clear all local storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear all cookies (if any)
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  
  // Sign out with NextAuth
  await signOut({ 
    callbackUrl: '/',
    redirect: true 
  });
};