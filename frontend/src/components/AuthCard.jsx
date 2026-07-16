"use client";

import React from "react";
import Link from "next/link";

export default function AuthCard({
  title,
  error,
  isLoading,
  submitButtonText,
  onSubmit,
  children,
  footerText,
}) {
  return (
    <div className="max-w-sm w-full rounded-lg shadow-md bg-white p-5 space-y-4 border border-zinc-200 z-10 transition-all">
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold text-zinc-950">{title}</h1>
        <p className="text-zinc-500 text-xs leading-relaxed">
          By logging in, you accept our{" "}
          <Link className="text-blue-500 hover:text-blue-700" href="/terms">
            terms
          </Link>{" "}
          and{" "}
          <Link className="text-blue-500 hover:text-blue-700" href="/privacy">
            privacy policy
          </Link>
          .
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 text-xs font-medium text-red-500 bg-red-50 border border-red-200 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {children}

        {/* Submit Button */}
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 border border-transparent h-10 px-4 py-2 w-full bg-zinc-900 hover:bg-zinc-800 text-white mt-2 cursor-pointer disabled:opacity-50"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Authenticating..." : submitButtonText}
        </button>
      </form>

      {/* Separator */}
      <div className="flex items-center space-x-2">
        <hr className="flex-grow border-zinc-200" />
        <span className="text-zinc-400 text-sm">OR</span>
        <hr className="flex-grow border-zinc-200" />
      </div>

      {/* Social Logins */}
      <div className="space-y-2">
        {/* Google Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent h-10 px-4 py-2 w-full bg-[#4285F4] text-white hover:bg-[#3370d4] cursor-pointer"
        >
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.89 21.56,11.47 21.35,11.1z"
                fill="white"
              />

              <path
                d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.3,0.98 -2.35,0 -4.34,-1.58 -5.05,-3.72H2.9v2.66c1.49,2.96 4.54,4.86 8.1,4.86z"
                fill="white"
                fillOpacity="0.85"
              />

              <path
                d="M6.95,13.08c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.02H2.9C2.3,8.22 1.96,9.6 1.96,11.08c0,1.48 0.34,2.86 0.94,4.06l4.05,-3.06z"
                fill="white"
                fillOpacity="0.85"
              />

              <path
                d="M12,4.22c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,1.55 14.42,0.8 12,0.8 8.44,0.8 5.39,2.7 3.9,5.66l4.05,3.06c0.71,-2.14 2.7,-3.72 5.05,-3.72z"
                fill="white"
                fillOpacity="0.85"
              />
            </svg>
            Login with Google
          </div>
        </button>

        {/* GitHub Button */}
        <button
          type="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent h-10 px-4 py-2 w-full bg-black text-white hover:bg-zinc-900 cursor-pointer"
        >
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Login with GitHub
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs font-semibold text-zinc-500 pt-2 border-t border-zinc-100">
        {footerText}
      </div>
    </div>
  );
}
