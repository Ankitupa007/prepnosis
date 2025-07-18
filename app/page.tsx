import WebsiteHeader from "@/components/common/website-header";
import HomeCTABtn from "@/components/home-cta-btn";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mx-auto w-full">
      <WebsiteHeader />
      <main className="max-w-5xl mx-auto w-full px-2">
        <section className="w-full py-8 md:py-24 lg:py-32 xl:py-24">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-6">
                <Badge variant={"outline"}>Free & Open-source</Badge>
                <h1 className="text-3xl text-[#6FCCCA] font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  NEET-PG & INICET Mock Test Practice Platform
                </h1>
                <p className="mx-auto text-sm md:text-xl max-w-[700px] text-gray-500 md:text-md dark:text-gray-400">
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
          © 2025 Prepnosis. All rights reserved. Made with{" "}
          <span className="text-red-500">❤</span> by{" "} Prepnosis Team
        </p>
      </div>
    </div>
  );
}
