"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loginValue, setLoginValue] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier: loginValue, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      console.log("Login success:", data)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup className="gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Login to your account</h1>
          <p className="text-xs text-muted-foreground font-body">
            Enter your email below to login
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm font-medium text-red-500 bg-red-50/50 border border-red-200/50 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Field className="grid gap-2 text-center">
            <FieldLabel htmlFor="identifier" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground font-tech">Email or Username</FieldLabel>
            <Input 
              id="identifier" 
              type="text" 
              className="h-10 px-4 text-center text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-body text-on-surface"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              required 
            />
          </Field>
          <Field className="grid gap-2 text-center">
            <FieldLabel htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground font-tech">Password</FieldLabel>
            <Input 
              id="password" 
              type="password" 
              className="h-10 px-4 text-center text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-body text-on-surface"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <div className="flex justify-center">
              <a
                href="#"
                className="text-[10px] font-bold text-secondary hover:underline underline-offset-4 tracking-widest font-tech uppercase mt-2"
              >
                Forgot?
              </a>
            </div>
          </Field>
        </div>

        <Field>
          <Button type="submit" disabled={isLoading} className="h-12 w-full bg-secondary text-on-secondary font-bold font-tech text-sm rounded-xl hover:brightness-105 active:scale-[0.98] transition-all shadow-md shadow-secondary/10">
            {isLoading ? "AUTHENTICATING..." : "LOGIN"}
          </Button>
        </Field>

        <div className="flex flex-col gap-6">
          <FieldSeparator className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">Or continue with</FieldSeparator>
          <Field>
            <Button variant="outline" type="button" className="h-10 w-full rounded-xl border-outline-variant hover:bg-surface-container-low transition-all font-tech font-bold text-[10px] tracking-widest uppercase">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 mr-2">
                <path
                  d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  fill="currentColor"
                />
              </svg>
              GITHUB
            </Button>
            <FieldDescription className="text-center mt-6 text-xs font-body border-t border-outline-variant pt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="ml-2 font-bold text-secondary hover:underline underline-offset-4">
                SIGN UP
              </Link>
            </FieldDescription>
          </Field>
        </div>
      </FieldGroup>
    </form>
  )
}
