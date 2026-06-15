"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import AuthCard from "@/components/AuthCard";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiRequest<{ message?: string }>("/api/v1/users/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-black overflow-hidden relative select-none"
      style={{
        backgroundImage: "url('/signup_bg_sequoia.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Soft Purple Radial Glow at the Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[35vh] bg-[radial-gradient(circle_at_bottom,rgba(139,92,246,0.25)_0%,transparent_60%)] pointer-events-none blur-3xl z-0" />

      {/* Render the reusable AuthCard */}
      <AuthCard
        title="Sign Up"
        error={error}
        isLoading={isLoading}
        submitButtonText="Create Account"
        onSubmit={handleSignup}
        footerText={
          <>
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-500 hover:text-blue-700 ml-1 font-bold"
            >
              Login
            </Link>
          </>
        }
      >
        {/* Full Name & Username (Side by Side) */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-1 text-left">
            <label
              className="text-xs font-semibold text-zinc-700"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
              type="text"
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex-1 space-y-1 text-left">
            <label
              className="text-xs font-semibold text-zinc-700"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
              type="text"
              id="username"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1 text-left">
          <label
            className="text-xs font-semibold text-zinc-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
            type="email"
            id="email"
            name="email"
            placeholder="manish@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-1 text-left">
          <label
            className="text-xs font-semibold text-zinc-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </AuthCard>
    </div>
  );
}
