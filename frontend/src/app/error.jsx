'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to console with stack trace
    console.error('Unhandled client error in route boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white dark:bg-[#101010] text-neutral-900 dark:text-white">
      <div className="w-full max-w-md p-8 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md shadow-xl flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 flex items-center justify-center text-red-600 dark:text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Something went wrong</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {error?.message || "An unexpected error occurred while loading this view."}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2 w-full">
          <Button
            variant="outline"
            onClick={() => reset ? reset() : window.location.reload()}
            className="flex-1 h-10 gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            asChild
            className="flex-1 h-10 gap-2 cursor-pointer bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
