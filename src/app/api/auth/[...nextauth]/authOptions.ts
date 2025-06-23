import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export const authOptions = {
  providers: [
    Providers.Credentials({
      // ...existing configuration for credentials provider...
    }),
    // ...other providers if any...
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userClass = user.userClass;
      }
      return token;
    },

    async session({ session, token }) {
      console.log("Session callback - Session:", session, "Token:", token);

      if (token) {
        session.user.id = token.id as string;
        session.user.userClass = token.userClass as string; // Make sure this line exists
      }

      console.log("Final session with userClass:", session); // Add this debug log

      return session;
    },
  },

  // ...rest of the configuration...
};

export default NextAuth(authOptions);