import { DailyQuestionCard } from "@/components/daily-question";
import { Badge } from "@/components/ui/badge";
import UserHeader from "@/components/user-header";
import { createClient } from "@/supabase/server";
import {
  BookCheck,
  ClipboardPlus,
  FileQuestion,
  FileText,
  ArrowRight,
  TrendingUp,
  Calendar,
  Hexagon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Enhanced Header */}
      <UserHeader text="Dashboard" />
      <main className="flex-1 mx-auto w-full px-2">
        {/* Enhanced Action Cards */}
        <section className="w-full py-8 md:py-8 lg:py-8">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Custom Test Card */}
              <Link href="/custom-test" className="group">
                <div className="relative bg-background rounded-2xl hover:shadow-md transition-all duration-500 p-6 border border-border hover:border-[#6FCCCA]/30 transform hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6FCCCA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="pushable bg-[#31AFAD]">
                        <span className="front text-background px-6 py-4 bg-[#6FCCCA]">
                          <ClipboardPlus className="h-8 w-8" />
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-[#6FCCCA]/30 text-[#6FCCCA]"
                      >
                        Popular
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-[#6FCCCA] transition-colors">
                      Custom Test
                    </h3>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                      Create personalized tests by selecting specific subjects
                      and topics to focus on your weak areas.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Practice subjects your way</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#6FCCCA] group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Grand Tests Card */}
              <Link href="/grand-tests" className="group">
                <div className="relative bg-background rounded-2xl hover:shadow-md transition-all duration-500 p-6 border border-border hover:border-orange-500/30 transform hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="pushable bg-orange-700">
                        <span className="front text-background px-6 py-4 bg-orange-500">
                          <FileText className="h-8 w-8" />
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-[#6FCCCA]/30 text-orange-500"
                      >
                        Featured
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-orange-400 transition-colors">
                      Grand Tests
                    </h3>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                      Take comprehensive mock exams to evaluate your overall
                      preparation and compete with peers nationwide.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>Ranking System</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-orange-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Qbank Card */}
              <Link href="/polygons" className="group">
                <div className="relative bg-background rounded-2xl hover:shadow-md transition-all duration-500 p-6 border border-border hover:border-blue-500/30 transform hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="pushable bg-blue-700">
                        <span className="front text-background px-6 py-4 bg-blue-500">
                          <Hexagon className="h-8 w-8" />
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs border-[#6FCCCA]/30 text-blue-500"
                      >
                        Featured
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                      Subject Polygons
                    </h3>
                    <p className="text-gray-500 mb-4 leading-relaxed">
                      Visualize your strengths and weaknesses, and target your
                      practice for maximum improvement.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookCheck className="h-4 w-4" />
                        <span>Detailed Analysis</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Welcome Section */}
        <section className="w-full">
          <DailyQuestionCard />
          {/* <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-6 max-w-4xl">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#6FCCCA] to-[#4A9B99] bg-clip-text text-transparent sm:text-5xl md:text-6xl lg:text-7xl/none tracking-tight">
                    Start Your NEET-PG & INICET Journey
                  </h1>
                  <p className="mx-auto max-w-[700px] text-lg text-gray-600 leading-relaxed">
                    Master medical entrance exams with our comprehensive collection of
                    <span className="font-semibold text-[#6FCCCA]"> 194,000+ MCQs</span> designed
                    for NEET-PG & INICET success.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#6FCCCA]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-[#6FCCCA]" />
                      <span className="text-sm font-medium text-gray-600">Tests Taken</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">24</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#6FCCCA]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">78%</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#6FCCCA]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-600">Rank</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">#156</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#6FCCCA]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </section>
      </main>
    </div>
  );
}

async function UserData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userData = user?.user_metadata;

  return (
    <div className="max-w-2xl w-full mx-auto space-y-4">
      <div className="text-center">
        <h2 className="text-sm md:text-sm font-bold text-foreground">
          Welcome, {userData?.full_name || "Student"}!
        </h2>
      </div>
    </div>
  );
}
