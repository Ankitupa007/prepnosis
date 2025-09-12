import type {Metadata} from "next";
import LoginForm from "./login-form";
import WebsiteHeader from "@/components/common/website-header";
import {Suspense} from "react";

export const metadata: Metadata = {
  title: "Login | Prepnosis",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <main>
      <WebsiteHeader />
      <section>
        <div className="grid min-h-svh lg:grid-cols-2 bg-primary/20">
          <div className="flex flex-col gap-4 p-6 md:p-10">
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
          </div>
          <div className="bg-[#FAFAEB]/50 relative hidden lg:block"></div>
        </div>
      </section>
    </main>
  );
}
