"use client";
import {useAuth} from "@/lib/auth-context";
import Link from "next/link";

export default function HomeCTABtn() {
  const { user } = useAuth();

  return (
    <div className="py-8">
      {user ? (
        <div>
          <button className="w-full py-8 pushable bg-[#31AFAD]">
            <Link
              href={"/dashboard"}
              className="text-xl font-bold front text-background text-background w-full px-8 py-4 bg-[#6FCCCA]"
            >
              Dashboard
            </Link>
          </button>
        </div>
      ) : (
        <button className="w-full py-8 px-24  pushable bg-[#31AFAD]">
          <Link
            href={"/login"}
            className="text-xl font-bold front text-background px-8 py-4 bg-[#6FCCCA]"
          >
            Get Started
          </Link>
        </button>
      )}
    </div>
  );
}
