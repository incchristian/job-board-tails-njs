import NextAuth from "next-auth";
import { authOptions } from "./authOptions.js"; // Try .js extension

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };