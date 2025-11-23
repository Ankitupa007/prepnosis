"use client"

import SubjectIcons from "@/components/common/SubjectIcons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import UserHeader from "@/components/user-header";
import { cn } from "@/lib/utils";
import { ClipboardPlus, Loader, Zap } from "lucide-react";
import { toast } from "sonner";
import { createCustomTest } from "@/app/data/custom-test-actions/create-custom-test";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { testsKeys } from "@/hooks/tests/useTests";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface Subject {
    id: string;
    name: string;
}

// Client Component for form handling
export default function CreateCustomTestClient({ subjects }: { subjects: Subject[] }) {
    const [isLoading, setIsLoading] = useState(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(25);
    const [testMode, setTestMode] = useState<"regular" | "exam">("regular");
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
        subjects.map((s) => s.id)
    );
    const [enableSharing, setEnableSharing] = useState(true);
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const router = useRouter();

    const presets = [
        { questions: 10, label: "Quick", icon: Zap, description: "10" },
        { questions: 25, label: "Standard", icon: Zap, description: "25" },
        { questions: 50, label: "Extended", icon: Zap, description: "50" },
        { questions: 100, label: "TestLike", icon: Zap, description: "100" },
    ];

    async function handleCreateTest(formData: FormData) {
        setIsLoading(true);
        console.log(formData)
        const result = await createCustomTest(formData);
        setIsLoading(false);

        if (result && "error" in result) {
            toast.error(result.error);
        } else if (result && "testId" in result) {
            toast.success(`Custom test created successfully!`);
            // Invalidate cache to ensure AllTests page updates
            if (user?.id) {
                await queryClient.invalidateQueries({ queryKey: testsKeys.user(user.id) });
            }
            router.push(`/custom-test/${result.testId}`);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <UserHeader text="Create Custom Test" />

            <div className="max-w-3xl mx-auto py-6 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Create Your Test</h1>
                    <p className="text-foreground/60">Quick setup, powerful practice</p>
                </div>

                <form action={handleCreateTest} className="space-y-4">
                    <section className="grid md:grid-cols-2 gap-4">
                        <Card className="border border-border shadow-sm bg-background">
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-4">Choose Total Questions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {presets.map((preset) => {
                                        const Icon = preset.icon;
                                        const isSelected = numberOfQuestions === preset.questions;
                                        return (
                                            <div key={preset.questions}>
                                                <button
                                                    type="button"
                                                    onClick={() => setNumberOfQuestions(preset.questions)}
                                                    className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-left w-full ${isSelected
                                                            ? "bg-[#6FCCCA] border-[#6FCCCA] text-background shadow-sm"
                                                            : "border-border border-dashed hover:border-border/60"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Icon className="h-5 w-5" />
                                                        <p>{preset.description}</p>
                                                    </div>
                                                </button>
                                                <input
                                                    type="radio"
                                                    name="numberOfQuestions"
                                                    value={preset.questions}
                                                    checked={isSelected}
                                                    className="hidden"
                                                    readOnly
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border border shadow-sm bg-background">
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-4">Test Mode</h3>
                                <RadioGroup
                                    name="testMode"
                                    value={testMode}
                                    onValueChange={(value) => setTestMode(value as "regular" | "exam")}
                                    className="grid grid-cols-1 gap-3"
                                >
                                    <Label htmlFor="regular" className="font-medium cursor-pointer">
                                        <div
                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${testMode === "regular"
                                                    ? "border-[#6FCCCA] bg-[#6FCCCA]/5"
                                                    : "border-border hover:border-border/50"
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <RadioGroupItem
                                                    value="regular"
                                                    id="regular"
                                                    className="border-[#6FCCCA] text-[#6FCCCA]"
                                                />
                                                <div>
                                                    Regular Mode
                                                    <p className="text-sm font-normal text-foreground/50 mt-2">
                                                        Instant answer after each question
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Label>
                                    <Label htmlFor="exam" className="font-medium cursor-pointer">
                                        <div
                                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${testMode === "exam"
                                                    ? "border-[#6FCCCA] bg-[#6FCCCA]/5"
                                                    : "border-border hover:border-border/50"
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <RadioGroupItem
                                                    value="exam"
                                                    id="exam"
                                                    className="border-[#6FCCCA] text-[#6FCCCA]"
                                                />
                                                <div>
                                                    Exam Mode
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Results shown at the end
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Label>
                                </RadioGroup>
                            </CardContent>
                        </Card>
                    </section>

                    <Card className="border-border border shadow-sm bg-background">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold">Subjects</h3>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSubjects(subjects.map((s) => s.id))}
                                        className="text-sm text-[#6FCCCA] hover:text-[#6FCCCA]/80 font-medium"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSubjects([])}
                                        className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {subjects.map((subject) => {
                                    const isSelected = selectedSubjects.includes(subject.id);
                                    return (
                                        <div key={subject.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedSubjects((prev) =>
                                                            prev.filter((id) => id !== subject.id)
                                                        );
                                                    } else {
                                                        setSelectedSubjects((prev) => [...prev, subject.id]);
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1 transition-all duration-200 ${isSelected
                                                        ? "bg-[#6FCCCA] border-[#6FCCCA] border text-background shadow-sm"
                                                        : "bg-none text-foreground/50 border-2 border-dashed border-border hover:border-border/60"
                                                    }`}
                                            >
                                                <SubjectIcons subjectName={subject.name} styles="w-4 h-4" />
                                                {subject.name}
                                            </button>
                                            <input
                                                type="checkbox"
                                                name="subjects"
                                                value={subject.id}
                                                checked={isSelected}
                                                className="hidden"
                                                readOnly
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedSubjects.length > 0 && (
                                <p className="text-sm text-gray-600 mt-3">
                                    {selectedSubjects.length} of {subjects.length} subjects selected
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="w-full mx-auto">
                        <Button
                            type="submit"
                            disabled={isLoading || selectedSubjects.length === 0}
                            className="font-semibold pushable bg-[#31AFAD] w-full"
                        >
                            {isLoading ? (
                                <div className="front text-background bg-[#6FCCCA] w-full py-2">
                                    <div className={cn("flex items-center justify-center gap-3")}>
                                        <Loader className="animate-spin" size={18} />
                                        <p className="text-lg animate-pulse">Creating test</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="front text-background bg-[#6FCCCA] w-full py-2">
                                    <div className={cn("flex items-center justify-center gap-3")}>
                                        <ClipboardPlus size={18} />
                                        <p className="text-lg">Create test</p>
                                    </div>
                                </div>
                            )}
                        </Button>
                    </div>
                    <input type="hidden" name="enableSharing" value={enableSharing.toString()} />
                </form>
            </div>
        </div>
    );
}