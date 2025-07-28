import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const db = await open({
            filename: "./database.sqlite",
            driver: sqlite3.Database,
          });

          // Get user from database INCLUDING userType
          const user = await db.get(
            "SELECT id, email, password, name, userClass FROM users WHERE email = ?",
            [credentials.email]
          );

          console.log("Database user:", user);

          await db.close();

          if (!user) {
            return null;
          }

          // Check password
          let passwordValid = false;
          try {
            passwordValid = await bcrypt.compare(credentials.password, user.password);
          } catch (error) {
            passwordValid = credentials.password === user.password;
          }

          if (passwordValid) {
            const returnUser = {
              id: user.id.toString(),
              name: user.name || user.email,
              email: user.email,
              userClass: user.userClass,
            };
            console.log("Returning user:", returnUser);
            return returnUser;
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - user:", user, "token:", token);
      if (user) {
        token.id = user.id;
        token.userClass = user.userClass;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", token);
      if (token) {
        session.user.id = token.id;
        session.user.userClass = token.userClass;
      }
      console.log("Final session:", session);
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days (in seconds)
    updateAge: 24 * 60 * 60, // 24 hours - update session if older than this
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days (in seconds)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}