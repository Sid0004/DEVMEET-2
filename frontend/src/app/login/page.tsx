import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-black overflow-hidden relative select-none"
      style={{
        backgroundImage: "url('/signup_bg_sequoia.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Soft Purple Radial Glow at the Bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[35vh] bg-[radial-gradient(circle_at_bottom,rgba(139,92,246,0.25)_0%,transparent_60%)] pointer-events-none blur-3xl z-0" />

      {/* Render the white login form card */}
      <LoginForm />
    </div>
  );
}
