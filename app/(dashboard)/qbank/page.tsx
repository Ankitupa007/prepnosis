import { BookOpenText, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAuthState from "@/components/user-auth-state";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import HomeCTABtn from "@/components/home-cta-btn";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mx-auto w-full">
      <header className="container mx-auto py-4 px-6 flex items-center justify-between">
        <h1 className="font-bold text-xl text-[#6FCCCA]">Q-Bank</h1>
        <div className="flex items-center gap-4">
          <UserAuthState />
        </div>
      </header>
      <main className="max-w-5xl mx-auto w-full px-4">
        <section className="w-full py-8 md:py-24 lg:py-32 xl:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-6">
                <Badge variant={"outline"}>Free & Open-source</Badge>
                <h1 className="text-3xl text-[#6FCCCA] font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  NEET-PG & INICET MCQ Practice Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-md dark:text-gray-400">
                  Practice more than 194k+ Multiple-Choice Questions (MCQs) designed to address realworld medical entrance exam like NEET-PG & INICET.
                </p>
              </div>
              <div className="space-x-4 my-6">
                <HomeCTABtn />
              </div>
            </div>
          </div>
        </section>
      </main>
      <div className=" py-6 w-full items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mx-auto">
          © 2025 prepnosis. All rights reserved | developed with ❤️ by Contributers
        </p>
      </div>
    </div>
  );
}
