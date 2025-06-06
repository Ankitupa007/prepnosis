import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserAuthState from "@/components/user-auth-state";
import { createClient } from "@/supabase/server";
import {
  BookCheck,
  ClipboardCheck,
  ClipboardPlus,
  FileQuestion,
  FileText,
  GraduationCap,
  Home,
  ArrowRight,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Clock,
  PlusCircle
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Enhanced Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="p-3 rounded-full w-10 h-10 bg-gray-100 hover:bg-gray-50" />
            <div className="hidden md:block">
              <Suspense
                fallback={
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                  </div>
                }>
                <UserData />
              </Suspense>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserAuthState />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full px-4">
        {/* Welcome Section */}
        <section className="w-full py-8 md:py-16 lg:py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-6 max-w-4xl">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[#66C3C1] to-[#4A9B99] bg-clip-text text-transparent sm:text-5xl md:text-6xl lg:text-7xl/none tracking-tight">
                    Choose Your Practice
                  </h1>
                  <p className="mx-auto max-w-[700px] text-lg text-gray-600 leading-relaxed">
                    Master medical entrance exams with our comprehensive collection of
                    <span className="font-semibold text-[#66C3C1]"> 194,000+ MCQs</span> designed
                    for NEET-PG & INICET success.
                  </p>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#66C3C1]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-[#66C3C1]" />
                      <span className="text-sm font-medium text-gray-600">Tests Taken</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">24</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#66C3C1]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">78%</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#66C3C1]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-600">Rank</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">#156</p>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-[#66C3C1]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">Streak</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-800">7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Quick Actions */}
        <div className="text-center">
              <p className="text-gray-600 mb-6">Quick actions to get you started</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-3 hover:bg-[#66C3C1] hover:text-white hover:border-[#66C3C1] transition-all duration-300"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create custom test
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-3 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6 py-3 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Study Plan
                </Button>
              </div>
            </div>

        {/* Enhanced Action Cards */}
        <section className="w-full py-8 md:py-12 lg:py-16">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

              {/* Custom Test Card */}
              <Link href="/custom-test" className="group">
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-200/50 hover:border-[#66C3C1]/30 transform hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#66C3C1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#66C3C1] to-[#4A9B99] text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <ClipboardPlus className="h-8 w-8" />
                      </div>
                      <Badge variant="outline" className="text-xs border-[#66C3C1]/30 text-[#66C3C1]">
                        Popular
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#66C3C1] transition-colors">
                      Custom Test
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Create personalized tests by selecting specific subjects and topics to focus on your weak areas.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Customizable</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[#66C3C1] group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Grand Tests Card */}
              <Link href="/dashboard/questions" className="group">
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-200/50 hover:border-[#66C3C1]/30 transform hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <FileText className="h-8 w-8" />
                      </div>
                      <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-600">
                        Featured
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                      Grand Tests
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Take comprehensive mock exams to evaluate your overall preparation and compete with peers nationwide.
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
              <Link href="/dashboard/analytics" className="group">
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-200/50 hover:border-[#66C3C1]/30 transform hover:-translate-y-2 overflow-hidden">
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <FileQuestion className="h-8 w-8" />
                      </div>
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600">
                        194k+ MCQs
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      Question Bank
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Access our extensive question bank with detailed explanations organized by subjects and topics.
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <BookCheck className="h-4 w-4" />
                        <span>Detailed Solutions</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
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
        <h2 className="text-sm md:text-sm font-bold text-gray-800">
          Welcome back, {userData?.full_name || 'Student'}!
        </h2>
      </div>
    </div>
  );
}