import type { Metadata } from "next";
import RegisterForm from "./register-form";
import WebsiteHeader from "@/components/common/website-header";
import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <main>
      <WebsiteHeader />
      <section>
        <AuthLayoutWrapper>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md pb-8 bg-background px-6 py-4 rounded-xl ">
              <div className="py-6 text-center space-y-2">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-foreground/60">
                  Sign up for a new account to get started
                </p>
              </div>
              <RegisterForm />
              <p className="px-8 py-4 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our terms of service and
                privacy policy..
              </p>
            </div>
          </div>
        </AuthLayoutWrapper>
      </section>
    </main>
  );
}
