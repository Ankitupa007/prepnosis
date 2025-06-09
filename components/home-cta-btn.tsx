"use client";
import { useAuth } from "@/lib/auth-context";
import React, { useTransition } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Icons } from "@/components/ui/icons"; // Import spinner icon

export default function HomeCTABtn() {
  const { user } = useAuth();
  const [isPending, startTransision] = useTransition();

  return (
    <div className=" gap-4">
      {user ? (
        <div>
          <Button className="w-full py-8 px-24 bg-[#6FCCCA] hover:bg-[#6FCCCA]/80" asChild>
            <Link href={"/dashboard"} className="font-bold text-xl">
              Go to dashboard
            </Link>
          </Button>
        </div>
      ) : (
        <Button className="w-full py-8 px-24 bg-[#6FCCCA] hover:bg-[#6FCCCA]/80" asChild>
          <Link href={"/login"} className="text-xl font-bold">
            Get Started
          </Link>
        </Button>
      )}
    </div>
  );
}
