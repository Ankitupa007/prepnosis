import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Mail, Trophy, Activity, Clock, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import UserHeader from "@/components/user-header";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    // Fetch user stats (test attempts)
    const { data: attempts } = await supabase
        .from("user_test_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Fetch subject performance
    const { data: subjectPerformance } = await supabase
        .from("user_subject_performance")
        .select("*, subjects(name)")
        .eq("user_id", user.id);

    const totalTests = attempts?.length || 0;
    const completedTests = attempts?.filter((a) => a.is_completed).length || 0;
    const totalScore = attempts?.reduce((acc, curr) => acc + (curr.total_score || 0), 0) || 0;
    const averageScore = completedTests > 0 ? (totalScore / completedTests).toFixed(1) : "0";

    // Calculate total time spent (in hours)
    const totalMinutes = attempts?.reduce((acc, curr) => acc + (curr.time_taken_minutes || 0), 0) || 0;
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <div className="">
            <UserHeader text='Profile' />
            <section className="p-8 flex flex-col gap-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card p-6 rounded-xl border shadow-sm">
                    <div className="flex flex-col md:flex-row justify-center items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Dr. {profile?.full_name || "Student"}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <CalendarDays className="h-4 w-4" />
                                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline">Edit Profile</Button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTests}</div>
                            <p className="text-xs text-muted-foreground">
                                {completedTests} completed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageScore}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all completed tests
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours}h</div>
                            <p className="text-xs text-muted-foreground">
                                Total time spent in tests
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--%</div>
                            <p className="text-xs text-muted-foreground">
                                Global accuracy rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="performance" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Subject Wise Performance</CardTitle>
                                <CardDescription>
                                    Your performance breakdown across different subjects.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {subjectPerformance && subjectPerformance.length > 0 ? (
                                        subjectPerformance.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                                <div className="space-y-1">
                                                    <p className="font-medium leading-none">{item.subjects?.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {item.total_questions_attempted} questions attempted
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="font-medium">{item.accuracy_percentage}%</p>
                                                        <p className="text-xs text-muted-foreground">Accuracy</p>
                                                    </div>
                                                    <Badge variant={
                                                        (item.accuracy_percentage || 0) >= 70 ? "default" :
                                                            (item.accuracy_percentage || 0) >= 40 ? "secondary" : "destructive"
                                                    }>
                                                        {(item.accuracy_percentage || 0) >= 70 ? "Strong" :
                                                            (item.accuracy_percentage || 0) >= 40 ? "Average" : "Weak"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No performance data available yet. Start taking tests to see your stats!
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Test Attempts</CardTitle>
                                <CardDescription>
                                    History of your recent test attempts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {attempts && attempts.length > 0 ? (
                                        attempts.slice(0, 5).map((attempt) => (
                                            <div key={attempt.id} className="flex items-center">
                                                <div className="ml-4 space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        Test Attempt
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(attempt.created_at!).toLocaleDateString()} at {new Date(attempt.created_at!).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div className="ml-auto font-medium">
                                                    {attempt.is_completed ? (
                                                        <span className="text-green-600">Completed</span>
                                                    ) : (
                                                        <span className="text-yellow-600">In Progress</span>
                                                    )}
                                                </div>
                                                <div className="ml-4 text-right w-20">
                                                    <div className="text-sm font-medium">{attempt.total_score || 0}</div>
                                                    <div className="text-xs text-muted-foreground">Score</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No recent activity.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
}
