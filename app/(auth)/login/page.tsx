import type { Metadata } from "next";
import LoginForm from "./login-form";
import { Suspense } from "react";
import UserHeader from "@/components/user-header";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/common/logo";
import WebsiteHeader from "@/components/common/website-header";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <main>
      <WebsiteHeader />
      <div className="container py-4  px-6 flex mx-auto flex-col justify-center ">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
