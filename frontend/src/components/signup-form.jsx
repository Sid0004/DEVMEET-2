"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SquigglyText } from "@/components/ui/squiggly-text";

import LegalModal from "@/components/LegalModal";

export function SignupForm({ className, ...props }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [legalModal, setLegalModal] = useState({ isOpen: false, tab: 'privacy' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState("individual"); // 'individual' | 'organization'
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    otp: "",
    organizationName: "",
  });

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.trim()) {
      setError("Please enter your email address to receive a verification code");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSendingOtp(true);
    setError("");
    setOtpSuccessMsg("");

    try {
      await apiRequest("/api/v1/users/send-otp", {
        method: "POST",
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      setOtpSent(true);
      setOtpSuccessMsg("6-digit code sent to your inbox!");
      setResendTimer(60); // 60s cooldown
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to send verification code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError("");
      try {
        const response = await apiRequest("/api/v1/users/google-login", {
          method: "POST",
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (response && response.data) {
          dispatch(
            setCredentials({
              user: response.data.user,
              token: response.data.accessToken,
            }),
          );

          if (response.data.user.isOnboarded) {
            window.location.href = "/dashboard";
          } else {
            window.location.href = "/onboarding";
          }
        } else {
          setError("Invalid response from server.");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || "Google authentication failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google Login Error:", errorResponse);
      setError("Google sign-in was cancelled or encountered an error.");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!otpSent) {
      setError("Please click 'Send Code' to verify your email address first");
      setIsLoading(false);
      return;
    }

    if (!formData.otp || formData.otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code sent to your email");
      setIsLoading(false);
      return;
    }

    if (accountType === "organization" && !formData.organizationName?.trim()) {
      setError("Please enter your organization or team name");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        otp: formData.otp.trim(),
        accountType,
        ...(accountType === "organization"
          ? { organizationName: formData.organizationName.trim() }
          : {}),
      };

      await apiRequest("/api/v1/users/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      router.push("/login?registered=true");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
        setError("Unable to connect. Please check your internet connection and try again.");
      } else {
        setError(msg || "Unable to create account. Please check your verification code and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      setError("GitHub client ID is not configured.");
      return;
    }
    const redirectUri = `${window.location.origin}/login`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user%20user:email`;
  };

  const handleSocialClick = (provider) => {
    if (provider === "Google") {
      handleGoogleLogin();
    } else if (provider === "GitHub") {
      handleGithubLogin();
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3.5">
          {/* Header */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1
              className="text-2xl sm:text-3xl font-normal text-neutral-900 dark:text-[#f3f3f3] tracking-tight"
              style={{ fontFamily: "var(--font-default)" }}
            >
              Signup to{" "}
              <SquigglyText
                stepDuration={150}
                scale={[6, 9]}
                className="text-[#0051d5] dark:text-[#3b82f6] font-normal"
              >
                connect
              </SquigglyText>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Create your account to start collaborating
            </p>
          </div>

          {/* Account Type Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setAccountType("individual")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                accountType === "individual"
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200 dark:bg-[#282828] dark:text-white dark:border-white/10 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <User className={cn("w-3.5 h-3.5", accountType === "individual" ? "text-blue-600 dark:text-blue-400" : "")} />
              <span>Individual</span>
            </button>

            <button
              type="button"
              onClick={() => setAccountType("organization")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                accountType === "organization"
                  ? "bg-white text-neutral-900 shadow-sm border border-neutral-200 dark:bg-[#282828] dark:text-white dark:border-white/10 font-semibold"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              <Building2 className={cn("w-3.5 h-3.5", accountType === "organization" ? "text-blue-600 dark:text-blue-400" : "")} />
              <span>Team / Org</span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 text-xs sm:text-sm font-medium text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-center">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Organization Name (if org selected) */}
          <AnimatePresence initial={false}>
            {accountType === "organization" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Field>
                  <FieldLabel htmlFor="organizationName" className="text-xs">
                    Organization / Company Name
                  </FieldLabel>
                  <Input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Acme Corp or Team Name"
                    value={formData.organizationName}
                    onChange={handleChange}
                    required={accountType === "organization"}
                  />
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400 inline shrink-0" />
                    You will be registered as workspace Admin
                  </span>
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row 1: Full Name + Username in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="fullName" className="text-xs">Full Name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="username" className="text-xs">Username</FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

          {/* Row 2: Email with Send OTP action */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="email" className="text-xs">
                {accountType === "organization" ? "Work Email" : "Email"}
              </FieldLabel>
              {otpSuccessMsg && (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {otpSuccessMsg}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={accountType === "organization" ? "name@company.com" : "name@example.com"}
                value={formData.email}
                onChange={handleChange}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant={otpSent ? "secondary" : "default"}
                onClick={handleSendOtp}
                disabled={isSendingOtp || resendTimer > 0 || !formData.email}
                className="h-9 px-3 text-xs shrink-0 font-medium cursor-pointer"
              >
                {isSendingOtp
                  ? "Sending..."
                  : resendTimer > 0
                  ? `Resend (${resendTimer}s)`
                  : otpSent
                  ? "Resend Code"
                  : "Send Code"}
              </Button>
            </div>
          </Field>

          {/* Conditional Animated OTP Cell (Only appears after clicking Send Code) */}
          <AnimatePresence initial={false}>
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <Field className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <FieldLabel htmlFor="otp" className="text-xs font-semibold text-blue-950 dark:text-blue-200">
                      Enter 6-Digit Email Verification Code
                    </FieldLabel>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                      Check Mailtrap / Inbox
                    </span>
                  </div>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={formData.otp}
                    onChange={handleChange}
                    required={otpSent}
                    autoFocus
                    className="font-mono tracking-[0.4em] text-center text-base font-bold bg-white dark:bg-[#181818]"
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Row 3: Password */}
          <Field>
            <FieldLabel htmlFor="password" className="text-xs">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters with 1 number"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Field>

          {/* Submit Button */}
          <Field className="pt-1">
            <Button type="submit" disabled={isLoading} className="w-full h-10">
              {isLoading
                ? "Creating account..."
                : accountType === "organization"
                ? "Create Team Account"
                : "Create Account"}
            </Button>
          </Field>

          {/* Divider */}
          <div className="relative my-0.5 flex items-center justify-center">
            <div className="border-t border-neutral-200 dark:border-white/10 w-full" />
            <span className="bg-white dark:bg-[#101010] px-3 text-[11px] uppercase text-neutral-400 dark:text-neutral-500 font-mono tracking-wider absolute">
              or
            </span>
          </div>

          {/* Apple & Google Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              className="h-9"
              disabled={isLoading}
              onClick={() => handleSocialClick("GitHub")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-1.5 h-4 w-4 fill-current"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-9"
              onClick={() => handleSocialClick("Google")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-1.5 h-4 w-4"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </div>

          {/* Prominent bottom Sign in CTA */}
          <div className="pt-1 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </form>
      <FieldDescription className="px-4 text-center text-[11px] text-neutral-400 dark:text-neutral-500">
        By clicking continue, you agree to our{" "}
        <button
          type="button"
          onClick={() => setLegalModal({ isOpen: true, tab: 'terms' })}
          className="underline hover:text-neutral-900 dark:hover:text-white cursor-pointer"
        >
          Terms of Service
        </button>{" "}
        and{" "}
        <button
          type="button"
          onClick={() => setLegalModal({ isOpen: true, tab: 'privacy' })}
          className="underline hover:text-neutral-900 dark:hover:text-white cursor-pointer"
        >
          Privacy Policy
        </button>.
      </FieldDescription>

      {/* Interactive In-App Legal Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        initialTab={legalModal.tab}
        onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
