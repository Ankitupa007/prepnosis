import type { Metadata } from "next";
import LoginForm from "./login-form";
import WebsiteHeader from "@/components/common/website-header";
import { Suspense } from "react";
import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export const metadata: Metadata = {
  title: "Login | Prepnosis",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <main>
      <WebsiteHeader />
      <section>
        <AuthLayoutWrapper>
          <div className="flex flex-1 items-start py-4 justify-center">
            <div className="w-full max-w-md pb-8 bg-background px-6 py-4 rounded-xl ">
              <div className="py-6 text-center space-y-2">
                <h1 className="text-2xl font-bold">Login to your account</h1>
                <p className="text-foreground/60">
                  Enter your email below to login to your account
                </p>
              </div>
              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </AuthLayoutWrapper>
      </section>
    </main>
  );
}
