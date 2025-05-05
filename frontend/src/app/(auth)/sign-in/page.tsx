// app/auth/sign-in/page.tsx
import { AuthForm } from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 dark">
      <div className="w-full max-w-sm">
        <AuthForm variant="login" />
      </div>
    </div>
  );
}
