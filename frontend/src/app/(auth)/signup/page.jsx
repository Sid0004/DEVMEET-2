import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="dark flex min-h-svh flex-col items-center justify-center gap-6 bg-[#101010] text-white p-6 md:p-10">
      <div className="w-full max-w-[320px]">
        <SignupForm />
      </div>
    </div>
  );
}
