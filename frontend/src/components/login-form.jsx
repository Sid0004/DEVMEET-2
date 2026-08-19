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

    const githubCode = searchParams.get("code");
    if (githubCode) {
      const loginWithGithub = async () => {
        setIsLoading(true);
        setError("");
        try {
          const response = await apiRequest("/api/v1/users/github-login", {
            method: "POST",
            body: JSON.stringify({ code: githubCode }),
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
          setError(msg || "GitHub authentication failed.");
        } finally {
          setIsLoading(false);
        }
      };

      loginWithGithub();
    }
  }, [searchParams, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    } else if (provider === "GitHub") {
      handleGithubLogin();
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
              disabled={isLoading}
              onClick={() => handleSocialClick("GitHub")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="mr-2 h-4 w-4 fill-current"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
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
