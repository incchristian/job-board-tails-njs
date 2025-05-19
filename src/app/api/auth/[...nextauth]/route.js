import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with:", credentials);
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          return null;
        }

        try {
          const db = await open({
            filename: "./database.sqlite",
            driver: sqlite3.Database,
          });

          const user = await db.get(
            "SELECT * FROM users WHERE email = ?",
            credentials.email
          );
          await db.close();

          if (!user) {
            console.log("No user found for email:", credentials.email);
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password);
          if (passwordMatch) {
            console.log("User authenticated:", {
              id: String(user.id),
              name: user.name,
              email: user.email,
              userClass: user.userClass,
            });
            return {
              id: String(user.id),
              name: user.name,
              email: user.email,
              userClass: user.userClass,
            };
          }
          console.log("Password mismatch for:", credentials.email);
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback - Token:", token, "User:", user);
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.userClass = user.userClass;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - Session:", session, "Token:", token);
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.userClass = token.userClass;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };