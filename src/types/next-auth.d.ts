import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userClass?: string;
    };
  }

  interface User {
    id: string;
    userClass: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userClass: string;
  }
}