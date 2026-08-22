"use client";

import React from "react";

export function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

export function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function ProfileSection({
  user,
  fullName,
  setFullName,
  username,
  setUsername,
  profession,
  setProfession,
  bio,
  setBio,
  githubUrl,
  setGithubUrl,
  linkedinUrl,
  setLinkedinUrl,
  setIsSaved,
}) {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col">
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 flex items-center justify-between">
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-700 dark:text-neutral-300">
          Developer Identity
        </span>
        <span className="text-[11px] font-mono text-neutral-400">PUBLIC PROFILE</span>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* Identity Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Alex Morgan"
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setIsSaved(false);
              }}
              placeholder="alexmorgan"
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm font-mono focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Email Address 
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 cursor-not-allowed font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
              Primary Role
            </label>
            <select
              value={profession}
              onChange={(e) => {
                setProfession(e.target.value);
                setIsSaved(false);
              }}
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            >
              <option value="Student">Student / Learner</option>
              <option value="Employee">Software Engineer / Employee</option>
              <option value="Freelancer">Freelance Developer</option>
              <option value="Other">Technical Recruiter / Other</option>
            </select>
          </div>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">
            Bio & Headline
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Briefly describe your stack, interests, or active projects..."
            className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 p-3 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <GithubIcon className="w-3.5 h-3.5" /> GitHub
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                setIsSaved(false);
              }}
              placeholder="https://github.com/username"
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
              <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
            </label>
            <input
              type="text"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                setIsSaved(false);
              }}
              placeholder="https://linkedin.com/in/username"
              className="bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm focus:border-neutral-900 dark:focus:border-white focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
