"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GalleryVerticalEnd } from "lucide-react"

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/login');
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (error) {
            alert("Connection error. Is the backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid min-h-svh lg:grid-cols-2 bg-background">
            <div className="flex flex-col items-center justify-center p-6 md:p-10 lg:p-12">
                <div className="w-full max-w-[320px]">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Create an account</h1>
                            <p className="text-xs text-muted-foreground font-body">
                                Join the circle of architects
                            </p>
                        </div>

                        <form onSubmit={handleSignup} className="flex flex-col gap-5">
                            <div className="flex flex-col gap-4">
                                <div className="grid gap-2 text-center">
                                    <label htmlFor="fullName" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground font-tech">Full Name</label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        className="h-10 px-4 text-center text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-body text-on-surface"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2 text-center">
                                    <label htmlFor="username" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground font-tech">Username</label>
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        className="h-10 px-4 text-center text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-body text-on-surface"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2 text-center">
                                    <label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground font-tech">Email</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="h-10 px-4 text-center text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-body text-on-surface"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2 text-center">
                                    <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground font-tech">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="h-10 px-4 text-center text-sm bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:ring-1 focus:ring-secondary/40 transition-all font-body text-on-surface"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="h-12 bg-secondary text-on-secondary font-bold font-tech text-sm rounded-xl hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-70 mt-3 shadow-md shadow-secondary/10"
                                disabled={isLoading}
                            >
                                {isLoading ? 'AUTHENTICATING...' : 'Create Account'}
                            </button>
                        </form>

                        <div className="text-center text-xs font-body border-t border-outline-variant pt-6">
                            <span className="text-muted-foreground">Already in?</span>
                            <Link href="/login" className="ml-2 font-bold text-secondary hover:underline underline-offset-4">SIGN IN</Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block overflow-hidden">
                <img
                    src="/1077.jpg"
                    alt="Abstract Architectural Flow"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] scale-105 hover:scale-110 transition-transform duration-[15s] ease-in-out"
                />
            </div>
        </div>
    );
}
