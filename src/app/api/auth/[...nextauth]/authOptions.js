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

          console.log("Database user:", user); // Add this debug line

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
              userClass: user.userClass, // Use userClass instead of userType
            };
            console.log("Returning user:", returnUser); // Add this debug line
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
      console.log("JWT callback - user:", user, "token:", token); // Add debug
      if (user) {
        token.id = user.id;
        token.userClass = user.userClass; // Change to userClass
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", token); // Add debug
      if (token) {
        session.user.id = token.id;
        session.user.userClass = token.userClass; // Change to userClass
      }
      console.log("Final session:", session); // Add debug
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}