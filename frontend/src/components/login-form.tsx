"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials, User } from "@/redux/features/authSlice";
import AuthCard from "@/components/AuthCard";

export function LoginForm() {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest<{
        data: { user: User; accessToken: string };
      }>("/api/v1/users/login", {
        method: "POST",
        body: JSON.stringify({ identifier: loginValue, password }),
      });

      // Store user info and token in Redux
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.accessToken,
        })
      );

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Login"
      error={error}
      isLoading={isLoading}
      submitButtonText="Login"
      onSubmit={handleSubmit}
      footerText={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-500 hover:text-blue-700 ml-1 font-bold"
          >
            Sign up
          </Link>
        </>
      }
    >
      {/* Email or Username */}
      <div className="space-y-1.5 text-left">
        <label
          className="text-sm font-semibold text-zinc-700"
          htmlFor="identifier"
        >
          Email or Username
        </label>
        <input
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
          type="text"
          id="identifier"
          placeholder="manish@example.com"
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5 text-left">
        <div className="flex justify-between items-center">
          <label
            className="text-sm font-semibold text-zinc-700"
            htmlFor="password"
          >
            Password
          </label>
          <a
            className="text-xs text-blue-500 hover:text-blue-700 font-semibold"
            href="#"
          >
            Forgot?
          </a>
        </div>
        <input
          className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent transition-all"
          type="password"
          id="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
    </AuthCard>
  );
}
