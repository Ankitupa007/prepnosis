import type { Metadata } from "next";
import RegisterForm from "./register-form";
import Logo from "@/components/common/logo";
import WebsiteHeader from "@/components/common/website-header";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <main>
      <WebsiteHeader />
      <div className="container py-4  px-6 flex mx-auto flex-col justify-center ">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign up for a new account to get started
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our terms of service and privacy
            policy.
          </p>
        </div>
      </div>
    </main>
  );
}
