import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background">
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-[400px]">
          <LoginForm />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <img
          src="/1077.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] scale-105 hover:scale-110 transition-transform duration-[10s]"
        />
      </div>
    </div>
  )
}
