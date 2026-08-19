"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/redux/hooks";
import { setCredentials } from "@/redux/features/authSlice";
import { apiRequest } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SquigglyText } from "@/components/ui/squiggly-text";

export function LoginForm({ className, ...props }) {

  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg("Account created successfully! Please sign in with your credentials.");
    }
  }, [searchParams]);

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
        setError(msg || "Google sign-in failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error("Google Login Error:", errorResponse);
      setError("Google sign-in was cancelled or encountered an error.");
    },
  });

  const handleSocialClick = (provider) => {
    if (provider === "Google") {
      handleGoogleLogin();
    } else {
      setError(`${provider} authentication is coming soon in the next release.`);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("/api/v1/users/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
          }),
        );
        
        // If user has completed onboarding, route to dashboard. Otherwise onboarding.
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
      if (msg.toLowerCase().includes("failed to fetch") || msg.toLowerCase().includes("network")) {
        setError("Unable to connect. Please check your internet connection and try again.");
      } else {
        setError(msg || "Invalid email/username or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };




  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1
              className="text-3xl font-normal text-neutral-900 dark:text-[#f3f3f3] tracking-tight"
              style={{ fontFamily: "var(--font-default)" }}
            >
              Login to{" "}
              <SquigglyText
                stepDuration={150}
                scale={[6, 9]}
                className="text-[#0051d5] dark:text-[#3b82f6] font-normal"
              >
                connect
              </SquigglyText>
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {successMsg && (
            <div className="p-3 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs sm:text-sm font-medium text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-center justify-center gap-2 text-center">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="identifier">Email or Username</FieldLabel>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              placeholder="name@example.com or username"
              value={formData.identifier}
              onChange={handleChange}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
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

          <Field>
            <Button type="submit" disabled={isLoading} className="w-full h-11">
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </Field>

          <div className="relative my-1 flex items-center justify-center">
            <div className="border-t border-neutral-200 dark:border-white/10 w-full" />
            <span className="bg-white dark:bg-[#101010] px-3 text-xs uppercase text-neutral-400 dark:text-neutral-500 font-mono tracking-wider absolute">
              or
            </span>
          </div>

          <Field className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              className="h-10"
              onClick={() => handleSocialClick("Apple")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4"
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
              className="h-10"
              onClick={() => handleSocialClick("Google")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4"
              >
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </Field>

          <div className="pt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
        By clicking continue, you agree to our <a href="#" className="underline hover:text-neutral-900 dark:hover:text-white">Terms of Service</a>{" "}
        and <a href="#" className="underline hover:text-neutral-900 dark:hover:text-white">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
