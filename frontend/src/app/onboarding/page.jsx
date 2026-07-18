"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  ArrowRight,
  X,
  GraduationCap,
  Briefcase,
  Code,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  // Step 1: 'profession' | Step 2: 'organization'
  const [currentStep, setCurrentStep] = useState("profession");
  // Form State
  const [profession, setProfession] = useState("");
  const [orgAction, setOrgAction] = useState("none");
  const [orgInput, setOrgInput] = useState("");

  const handleNextStep = () => {
    if (currentStep === "profession") {
      if (!profession) return; // Must select profession
      setCurrentStep("organization");
    }
  };

  const handleFinish = async (e) => {
    if (e) e.preventDefault();
    try {
      await apiRequest("/api/v1/users/onboard", {
        method: "POST",
        body: JSON.stringify({ profession, orgAction, orgInput }),
      });
      console.log("Onboarding Complete:", { profession, orgAction, orgInput });
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Push anyway to avoid soft-lock if API fails
      window.location.href = "/dashboard";
    }
  };

  const professionOptions = [
    {
      id: "Student",
      label: "Student",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: "Employee",
      label: "Employee",
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: "Freelancer",
      label: "Freelancer",
      icon: <Code className="w-5 h-5" />,
    },
    { id: "Other", label: "Other", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 selection:bg-blue-500/30">
      <div className="w-full max-w-2xl relative">
        {/* Step Indicator */}
        <div className="absolute -top-16 left-0 right-0 flex justify-center items-center gap-3">
          <div
            className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${currentStep === "profession" ? "bg-blue-500" : "bg-white/20"}`}
          />
          <div
            className={`h-1.5 w-16 rounded-full transition-colors duration-500 ${currentStep === "organization" ? "bg-blue-500" : "bg-white/20"}`}
          />
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: PROFESSION */}
          {currentStep === "profession" && (
            <motion.div
              key="step-profession"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
                Tell us about yourself
              </h1>
              <p className="text-gray-400 font-light mb-12">
                This helps us personalize your Devmeet experience.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-12">
                {professionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setProfession(opt.id)}
                    className={`group relative flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                      profession === opt.id
                        ? "bg-blue-500/10 border-blue-500 text-blue-400"
                        : "bg-[#111] border-white/5 hover:bg-[#161616] hover:border-white/20 text-gray-400"
                    }`}
                  >
                    <div className="mb-3">{opt.icon}</div>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextStep}
                disabled={!profession}
                className="w-full sm:w-auto px-8 py-3 bg-white text-black font-medium rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 2: ORGANIZATION */}
          {currentStep === "organization" && (
            <motion.div
              key="step-organization"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-3">
                  Setup your Workspace
                </h1>
                <p className="text-gray-400 font-light">
                  Join your team or start fresh.
                </p>
              </div>

              {orgAction === "none" ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Create Org Card */}
                  <button
                    onClick={() => setOrgAction("create")}
                    className="group relative flex flex-col items-start p-8 rounded-2xl bg-[#111] border border-white/5 hover:border-blue-500/50 hover:bg-[#161616] transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Create Workspace
                    </h3>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">
                      Start a new organization and invite your team.
                    </p>
                  </button>

                  {/* Join Org Card */}
                  <button
                    onClick={() => setOrgAction("join")}
                    className="group relative flex flex-col items-start p-8 rounded-2xl bg-[#111] border border-white/5 hover:border-emerald-500/50 hover:bg-[#161616] transition-all text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Join Workspace</h3>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">
                      Enter an invite code to join an existing team.
                    </p>
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#111] border border-white/5 rounded-2xl p-8 relative"
                >
                  <button
                    onClick={() => {
                      setOrgAction("none");
                      setOrgInput("");
                    }}
                    className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="mb-6">
                    <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      {orgAction === "create" ? (
                        <Building2 className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Users className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-medium mb-1">
                      {orgAction === "create"
                        ? "Name your workspace"
                        : "Enter invite code"}
                    </h3>
                  </div>

                  <form onSubmit={handleFinish} className="flex flex-col gap-4">
                    <input
                      type="text"
                      value={orgInput}
                      onChange={(e) => setOrgInput(e.target.value)}
                      placeholder={
                        orgAction === "create"
                          ? "e.g. Acme Corp"
                          : "e.g. INV-123456"
                      }
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-white/30 transition-colors font-light"
                      autoFocus
                      required
                    />

                    <button
                      type="submit"
                      className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      Complete Setup <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Independent fallback option (always visible in Step 2) */}
              {orgAction === "none" && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => handleFinish()}
                    className="text-sm text-gray-500 hover:text-white transition-colors font-light pb-1 border-b border-transparent hover:border-white/30"
                  >
                    Continue as an independent user
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
