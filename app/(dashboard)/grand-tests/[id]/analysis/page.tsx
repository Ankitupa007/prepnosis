"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import UserHeader from "@/components/user-header";
import { CircleProgress } from "@/components/common/CircleProgress";
import {
    Award,
    BookOpen,
    Trophy,
    CheckCircle2,
    XCircle,
    MinusCircle,
    Clock,
    Target,
} from "lucide-react";
import { toast } from "sonner";
import { TestAnalysis } from "@/lib/types/grand-tests-types";

const CountUp = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count}</>;
};

export default function AnalysisPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const { user } = useAuth();
    const { id } = use(params);
    const [analysis, setAnalysis] = useState<TestAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await fetch(`/api/grand-tests/${id}/analysis`);
                if (!response.ok) {
                    throw new Error("Failed to fetch analysis");
                }
                const data = await response.json();
                setAnalysis(data);
            } catch (error) {
                console.error("Error fetching analysis:", error);
                toast.error("Failed to load test analysis");
                router.push(`/grand-tests/${id}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (id && user) {
            fetchAnalysis();
        }
    }, [id, user, router]);

    if (isLoading) {
        return (
            <div className="container mx-auto">
                <UserHeader text="Test Analysis" />
                <div className="min-h-[70vh] flex items-center justify-center">
                    <LoadingSpinner text="Loading analysis" />
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-bold mb-4">Analysis Not Available</h1>
                    <p className="text-foreground/70 mb-6">
                        Complete the test to view your analysis.
                    </p>
                    <Button onClick={() => router.push(`/grand-tests/${id}`)}>
                        Back to Test
                    </Button>
                </div>
            </div>
        );
    }

    const { overall, sectionWise, subjectWise } = analysis;

    return (
        <div className="container mx-auto pb-8">
            <UserHeader text="Test Analysis" />

            <div className="max-w-6xl mx-auto px-4 space-y-6">
                {/* Overall Performance */}
                <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-secondary/20">
                    <CardHeader className="bg-secondary/30 pb-8">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Award className="h-8 w-8 text-yellow-500" />
                            Overall Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="-mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Score Circle */}
                            <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl shadow-sm border">
                                <CircleProgress
                                    percentage={overall.percentage}
                                    size={160}
                                    strokeWidth={12}
                                />
                                <div className="mt-6 text-center">
                                    <p className="text-4xl font-bold text-[#6FCCCA]">
                                        <CountUp end={overall.totalScore} />
                                        <span className="text-xl text-foreground/40 font-normal"> / {overall.maxScore}</span>
                                    </p>
                                    <p className="text-sm font-medium text-foreground/60 uppercase tracking-wider mt-1">Total Score</p>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="col-span-1 md:col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-card rounded-xl border shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="h-5 w-5 text-yellow-500" />
                                        <p className="text-sm font-medium text-foreground/60">Rank</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">#{overall.rank || "N/A"}</p>
                                        <p className="text-xs text-foreground/50 mt-1">
                                            Top {(100 - overall.percentile).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-card rounded-xl border shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="h-5 w-5 text-blue-500" />
                                        <p className="text-sm font-medium text-foreground/60">Accuracy</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{overall.accuracy}%</p>
                                        <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${overall.accuracy}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-card rounded-xl border shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-5 w-5 text-purple-500" />
                                        <p className="text-sm font-medium text-foreground/60">Time Taken</p>
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold">{overall.timeTaken}m</p>
                                        <p className="text-xs text-foreground/50 mt-1">
                                            Avg {(overall.timeTaken / overall.totalQuestions).toFixed(1)}m / q
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400">Correct</p>
                                    </div>
                                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                                        {overall.correctAnswers}
                                    </p>
                                </div>

                                <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <p className="text-sm font-medium text-red-700 dark:text-red-400">Incorrect</p>
                                    </div>
                                    <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                                        {overall.incorrectAnswers}
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50/50 dark:bg-gray-900/20 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MinusCircle className="h-5 w-5 text-gray-600" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-400">Unanswered</p>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                                        {overall.unanswered}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section-wise Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Section-wise Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Accuracy</TableHead>
                                    <TableHead>Correct</TableHead>
                                    <TableHead>Incorrect</TableHead>
                                    <TableHead>Unanswered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sectionWise.map((section) => (
                                    <TableRow key={section.section}>
                                        <TableCell className="font-medium">
                                            Section {section.section}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {section.score} / {section.maxScore}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={(section.score / section.maxScore) * 100}
                                                    className="h-2"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">{section.accuracy}%</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-green-600 dark:text-green-400">
                                                {section.correct}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-red-600 dark:text-red-400">
                                                {section.incorrect}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {section.unanswered}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Subject-wise Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subject-wise Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Accuracy</TableHead>
                                    <TableHead>Correct</TableHead>
                                    <TableHead>Incorrect</TableHead>
                                    <TableHead>Unanswered</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjectWise.map((subject) => (
                                    <TableRow key={subject.subjectName}>
                                        <TableCell className="font-medium">
                                            {subject.subjectName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">
                                                        {subject.score} / {subject.maxScore}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={(subject.score / subject.maxScore) * 100}
                                                    className="h-2"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold">{subject.accuracy}%</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-green-600 dark:text-green-400">
                                                {subject.correct}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-red-600 dark:text-red-400">
                                                {subject.incorrect}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {subject.unanswered}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                        onClick={() => router.push(`/grand-tests/${id}/section/1`)}
                        className="flex-1 bg-[#6FCCCA] hover:bg-[#6FCCCA]/80"
                        size="lg"
                    >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Review Explanations
                    </Button>
                    <Button
                        onClick={() => router.push(`/grand-tests/${id}/results`)}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                    >
                        <Trophy className="w-5 h-5 mr-2" />
                        View Leaderboard
                    </Button>
                    <Button
                        onClick={() => router.push("/grand-tests")}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                    >
                        Back to Tests
                    </Button>
                </div>
            </div>
        </div>
    );
}
