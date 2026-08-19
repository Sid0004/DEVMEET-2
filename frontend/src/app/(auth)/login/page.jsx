import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function LoginPage() {
  return (
    <div className="auth-container min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101010] text-neutral-900 dark:text-white p-4 relative">
      <div className="fixed top-4 right-4 z-50">
        <AnimatedThemeToggler />
      </div>
      <div className="w-full max-w-[360px]">
        <Suspense fallback={<div className="text-center text-sm text-neutral-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
