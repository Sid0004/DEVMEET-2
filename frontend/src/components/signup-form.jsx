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

export function SignupForm({ className, ...props }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState("individual"); // 'individual' | 'organization'
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    organizationName: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
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
        setError(msg || "Unable to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    if (provider === "Google") {
      handleGoogleLogin();
    } else {
      setError(`${provider} authentication is coming soon in the next release.`);
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

          {/* Row 2: Email + Password in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="email" className="text-xs">
                {accountType === "organization" ? "Work Email" : "Email"}
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={accountType === "organization" ? "name@company.com" : "name@example.com"}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="text-xs">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Field>
          </div>

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
              onClick={() => handleSocialClick("Apple")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-1.5 h-4 w-4"
              >
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Apple
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
        By clicking continue, you agree to our <a href="#" className="underline hover:text-neutral-900 dark:hover:text-white">Terms of Service</a>{" "}
        and <a href="#" className="underline hover:text-neutral-900 dark:hover:text-white">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
