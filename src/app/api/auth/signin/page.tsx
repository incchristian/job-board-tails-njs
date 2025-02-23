// src/app/auth/signin/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SimpleLayout from "@/components/Layouts/SimpleLayout";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Signin attempt with:", { email, password });

    if (!email || !password) {
      setError("Please fill in all fields.");
      console.log("Validation failed: Missing fields");
      return;
    }

    try {
      console.log("Calling signIn...");
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("NextAuth error:", result.error);
        throw new Error(result.error);
      }

      console.log("Login successful, redirecting to /pages/settings");
      router.push("/pages/settings"); // Updated to match your new Edit Profile page
    } catch (error: any) {
      setError(error.message || "Failed to login");
      console.error("Login error:", error);
    }
  };

  return (
    <SimpleLayout>
      <div className="flex items-center justify-center min-h-screen rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark overflow-hidden">
        <div className="flex flex-wrap items-center justify-center w-full h-full">
          <div className="hidden w-full xl:flex xl:w-1/2 items-center justify-center">
            <div className="flex flex-col px-26 py-17.5 text-center items-center justify-center">
              <Link className="mb-5.5 inline-block" href="/">
                <Image
                  className="hidden dark:block"
                  src={"/images/logo/logo.svg"}
                  alt="Logo"
                  width={176}
                  height={32}
                />
                <Image
                  className="dark:hidden"
                  src={"/images/logo/logo-dark.svg"}
                  alt="Logo"
                  width={176}
                  height={32}
                />
              </Link>
              <p className="text-xl font-semibold">
                Welcome Back! Please enter your details to sign in.
              </p>
            </div>
          </div>
          <div className="w-full xl:w-1/2 p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Sign In
              </button>
            </form>
            <p className="mt-4 text-center">
              Don’t have an account?{" "}
              <Link href="/auth/signup" className="text-blue-500 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default SignIn;