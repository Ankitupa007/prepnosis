"use client";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import SubjectIcons from "@/components/common/SubjectIcons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import UserHeader from "@/components/user-header";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { ClipboardPlus, Loader, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  description: string;
}

export default function CreateCustomTest() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Simplified form state with smart defaults
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(25);
  const [testMode, setTestMode] = useState<"regular" | "exam">("regular");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // New sharing state
  const [enableSharing, setEnableSharing] = useState(true);

  // Preset configurations for quick start
  const presets = [
    { questions: 10, label: "Quick", icon: Zap, description: "10" },
    { questions: 25, label: "Standard", icon: Zap, description: "25" },
    { questions: 50, label: "Extended", icon: Zap, description: "50" },
    { questions: 100, label: "TestLike", icon: Zap, description: "100" },
  ];

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects");
        if (response.ok) {
          const data = await response.json();
          setSubjects(data.subjects);
          // Auto-select all subjects by default for minimal friction
          setSelectedSubjects(data.subjects.map((s: Subject) => s.id));
        } else {
          toast.error("Failed to load subjects");
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast.error("Failed to load subjects");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Create custom test
  const handleCreateTest = async () => {
    if (!user) {
      toast.error("Please login to create tests");
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/tests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfQuestions,
          testMode,
          subjects: selectedSubjects,
          createdBy: user.id,
          enableSharing,
          shareExpiration: null, // Default to no expiration
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create test");
      }

      const result = await response.json();

      if (result.shareCode) {
        toast.success(`Test created with share code: ${result.shareCode}`);
        router.push(`/custom-test/${result.testId}`);
      }
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("Failed to create test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UserHeader text="Create Custom Test" />

      {loadingSubjects ? (
        <div className="h-[80vh] bg-background flex items-center justify-center">
          <LoadingSpinner text="Loading Subjects" />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold  mb-2">Create Your Test</h1>
            <p className="text-foreground/60">Quick setup, powerful practice</p>
          </div>

          <div className="space-y-4">
            <section className="grid md:grid-cols-2 gap-4">
              {/* Quick Presets */}
              <Card className="border border-border shadow-sm bg-background">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Choose Total Questions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {presets.map((preset) => {
                      const Icon = preset.icon;
                      const isSelected = numberOfQuestions === preset.questions;
                      return (
                        <button
                          key={preset.questions}
                          onClick={() => setNumberOfQuestions(preset.questions)}
                          className={`px-4 py-2 rounded-full border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "bg-[#6FCCCA] border-[#6FCCCA] text-background shadow-sm"
                              : "border-border border-dashed hover:border-border/60"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Icon className={`h-5 w-5 `} />
                            <p className={``}>{preset.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Test Mode - Simplified */}
              <Card className="border-border border shadow-sm bg-background">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">Test Mode</h3>
                  <RadioGroup
                    value={testMode}
                    onValueChange={(value) =>
                      setTestMode(value as "regular" | "exam")
                    }
                    className="grid grid-cols-1 gap-3"
                  >
                    <Label
                      htmlFor="regular"
                      className="font-medium cursor-pointer"
                    >
                      <div
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          testMode === "regular"
                            ? "border-[#6FCCCA] bg-[#6FCCCA]/5"
                            : "border-border hover:border-border-/50"
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
                    <Label
                      htmlFor="exam"
                      className="font-medium cursor-pointer "
                    >
                      <div
                        className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                          testMode === "exam"
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

            {/* Subject Selection - Simplified */}
            <Card className="border-border border shadow-sm bg-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Subjects</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedSubjects(subjects.map((s) => s.id))
                      }
                      className="text-sm text-[#6FCCCA] hover:text-[#6FCCCA]/80 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
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
                      <button
                        key={subject.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubjects((prev) =>
                              prev.filter((id) => id !== subject.id)
                            );
                          } else {
                            setSelectedSubjects((prev) => [
                              ...prev,
                              subject.id,
                            ]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-1 transition-all duration-200 ${
                          isSelected
                            ? "bg-[#6FCCCA] border-[#6FCCCA] border text-background shadow-sm"
                            : "bg-none text-foreground/50 border-2 border-dashed border-border hover:border-border/60"
                        }`}
                      >
                        <SubjectIcons
                          subjectName={subject.name}
                          styles="w-4 h-4"
                        />
                        {subject.name}
                      </button>
                    );
                  })}
                </div>

                {selectedSubjects.length > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    {selectedSubjects.length} of {subjects.length} subjects
                    selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Start Test Button */}
            <div className="w-full mx-auto">
              <button
                onClick={handleCreateTest}
                disabled={isLoading || selectedSubjects.length === 0}
                className="font-semibold pushable bg-[#31AFAD] w-full"
              >
                {isLoading ? (
                  <div className="front text-background bg-[#6FCCCA] w-full py-2">
                    <div
                      className={cn("flex items-center justify-center gap-3")}
                    >
                      <Loader className={"animate-spin"} size={18} />
                      <p className="text-lg animate-pulse">Creating test</p>
                    </div>
                  </div>
                ) : (
                  <div className="front text-background bg-[#6FCCCA] w-full py-2">
                    <div
                      className={cn("flex items-center justify-center gap-3")}
                    >
                      <ClipboardPlus className={""} size={18} />
                      <p className="text-lg">Create test</p>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
