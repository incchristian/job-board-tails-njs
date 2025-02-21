// src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) console.error("Database connection error:", err);
  else console.log("Connected to SQLite for auth");
});

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          throw new Error("Email and password are required");
        }

        return new Promise((resolve, reject) => {
          db.get(
            "SELECT * FROM users WHERE email = ?",
            [credentials.email],
            async (err, user) => {
              if (err) {
                console.error("Database query error:", err);
                return reject(new Error("Database error"));
              }
              if (!user) {
                console.error("No user found for email:", credentials.email);
                return reject(new Error("Invalid email or password"));
              }
              console.log("User found:", user);

              try {
                const isValid = await bcrypt.compare(
                  credentials.password,
                  user.password
                );
                console.log("Password comparison result:", isValid);
                if (!isValid) {
                  console.error("Password mismatch for user:", user.email);
                  return reject(new Error("Invalid email or password"));
                }
                console.log("User authenticated successfully:", user);
                resolve({
                  id: user.id.toString(),
                  email: user.email,
                  name: user.name || null,
                });
              } catch (bcryptError) {
                console.error("Bcrypt comparison error:", bcryptError);
                reject(new Error("Authentication error"));
              }
            }
          );
        });
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback:", { token, user });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback:", { session, token });
      session.user.id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };