// app/api/grand-tests/[id]/analysis/route.ts

import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getExamPatternConfig } from "@/lib/constants/exam-patterns";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get test details
        const { data: test, error: testError } = await supabase
            .from("grand_tests")
            .select("exam_pattern, total_questions, total_marks")
            .eq("id", id)
            .single();

        if (testError || !test) {
            return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }

        // Get user's attempt
        const { data: attempt, error: attemptError } = await supabase
            .from("user_grand_tests_attempts")
            .select("*")
            .eq("test_id", id)
            .eq("user_id", user.id)
            .eq("is_completed", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (attemptError || !attempt) {
            return NextResponse.json(
                { error: "No completed attempt found" },
                { status: 404 }
            );
        }

        // Get ranking
        const { data: ranking } = await supabase
            .from("test_rankings")
            .select("rank, percentile, score")
            .eq("test_id", id)
            .eq("user_id", user.id)
            .maybeSingle();

        // Get all answers with question details
        const { data: answers } = await supabase
            .from("user_grand_tests_answers")
            .select(
                `
        selected_option,
        is_correct,
        marks_awarded,
        section_number,
        grand_tests_questions!inner (
          subject_id,
          subjects (name)
        )
      `
            )
            .eq("attempt_id", attempt.id);

        const examConfig = getExamPatternConfig(test.exam_pattern);

        // Calculate section-wise performance
        const sectionWise = examConfig.sections.map((section) => {
            const sectionAnswers = answers?.filter(
                (a: any) => a.section_number === section.sectionNumber
            ) || [];

            const correct = sectionAnswers.filter((a: any) => a.is_correct).length;
            const answered = sectionAnswers.filter(
                (a: any) => a.selected_option !== null
            ).length;
            const incorrect = answered - correct;
            const unanswered = section.questionsCount - answered;
            const score = sectionAnswers.reduce(
                (sum: number, a: any) => sum + (a.marks_awarded || 0),
                0
            );

            return {
                section: section.sectionNumber,
                score,
                maxScore: section.questionsCount * examConfig.marksPerQuestion,
                correct,
                incorrect,
                unanswered,
                accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
                timeTaken: 0, // Would need to track this separately
            };
        });

        // Calculate subject-wise performance
        const subjectMap = new Map<string, any>();
        answers?.forEach((answer: any) => {
            const subjectName = answer.grand_tests_questions?.subjects?.name || "Unknown";

            if (!subjectMap.has(subjectName)) {
                subjectMap.set(subjectName, {
                    subjectName,
                    correct: 0,
                    incorrect: 0,
                    unanswered: 0,
                    total: 0,
                    score: 0,
                });
            }

            const subject = subjectMap.get(subjectName);
            subject.total++;

            if (answer.selected_option === null) {
                subject.unanswered++;
            } else if (answer.is_correct) {
                subject.correct++;
            } else {
                subject.incorrect++;
            }

            subject.score += answer.marks_awarded || 0;
        });

        const subjectWise = Array.from(subjectMap.values()).map((subject) => ({
            ...subject,
            maxScore: subject.total * examConfig.marksPerQuestion,
            accuracy:
                subject.total - subject.unanswered > 0
                    ? Math.round(
                        (subject.correct / (subject.total - subject.unanswered)) * 100
                    )
                    : 0,
        }));

        // Overall analysis
        const overall = {
            totalScore: attempt.total_score || 0,
            maxScore: test.total_marks,
            percentage: Math.round(
                ((attempt.total_score || 0) / test.total_marks) * 100
            ),
            rank: ranking?.rank || 0,
            percentile: ranking?.percentile || 0,
            totalQuestions: test.total_questions,
            correctAnswers: attempt.correct_answers || 0,
            incorrectAnswers: attempt.incorrect_answers || 0,
            unanswered: attempt.unanswered || 0,
            accuracy:
                attempt.correct_answers && attempt.incorrect_answers
                    ? Math.round(
                        (attempt.correct_answers /
                            (attempt.correct_answers + attempt.incorrect_answers)) *
                        100
                    )
                    : 0,
            timeTaken: attempt.time_taken_minutes || 0,
        };

        return NextResponse.json({
            overall,
            sectionWise,
            subjectWise,
            examPattern: test.exam_pattern,
            examConfig,
        });
    } catch (error) {
        console.error("Error fetching test analysis:", error);
        return NextResponse.json(
            { error: "Failed to fetch test analysis" },
            { status: 500 }
        );
    }
}
