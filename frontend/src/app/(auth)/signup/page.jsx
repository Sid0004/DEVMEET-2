import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="auth-container min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101010] text-neutral-900 dark:text-white p-4">
      <div className="w-full max-w-[420px]">
        <SignupForm />
      </div>
    </div>
  );
}
