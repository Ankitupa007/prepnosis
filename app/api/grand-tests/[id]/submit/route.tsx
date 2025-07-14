// app/api/grand-tests/[id]/submit.ts

import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface Answer {
  question_id: string;
  selectedOption: number;
  isCorrect: boolean;
  is_marked_for_review: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { attemptId, answers, currentSection } = body;

    const { data: attempt, error: attemptError } = await supabase
      .from("user_grand_tests_attempts")
      .select("*")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (attemptError) throw attemptError;
    if (!attempt || attempt.is_completed)
      return NextResponse.json(
        { error: "Invalid or already completed attempt" },
        { status: 406 }
      );

    const { data: test, error: testError } = await supabase
      .from("grand_tests")
      .select("negative_marking, test_type, exam_pattern")
      .eq("id", id)
      .single();

    if (testError) throw testError;

    // Calculate results
    const totalQuestions = answers.length;
    const answeredQuestions = answers.filter(
      (a: Answer) => a.selectedOption !== null
    ).length;
    const correctAnswers = answers.filter((a: Answer) => a.isCorrect).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const totalScore =
      test.exam_pattern === "NEET_PG"
        ? correctAnswers * 4 - (test.negative_marking ? incorrectAnswers : 0)
        : correctAnswers - (test.negative_marking ? incorrectAnswers : 0);

    // Save answers
    const userAnswerInserts = answers.map((a: Answer) => {
      let marksAwarded = 0;
      if (a.selectedOption !== null && a.selectedOption !== undefined) {
        marksAwarded = a.isCorrect
          ? test.exam_pattern === "NEET_PG"
            ? 4
            : 1
          : test.negative_marking
          ? -1
          : 0;
      }
      return {
        attempt_id: attemptId,
        question_id: a.question_id,
        selected_option: a.selectedOption,
        is_correct: a.isCorrect,
        marks_awarded: marksAwarded,
        answered_at: new Date().toISOString(),
      };
    });

    const { error: answersError } = await supabase
      .from("user_grand_tests_answers")
      .upsert(userAnswerInserts, {
        onConflict: "attempt_id,question_id",
      });

    if (answersError) throw answersError;

    // Time calculations
    const now = new Date();
    const startTime = new Date(attempt.started_at);
    const timeTakenMinutes = Math.floor(
      (now.getTime() - startTime.getTime()) / 60000
    );

    // Update attempt
    const { data: updatedAttempt, error: updateError } = await supabase
      .from("user_grand_tests_attempts")
      .update({
        is_completed: true,
        submitted_at: now.toISOString(),
        total_score: totalScore,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        unanswered: totalQuestions - answeredQuestions,
        time_taken_minutes: timeTakenMinutes,
        current_section: currentSection,
      })
      .eq("id", attemptId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Rankings
    if (test.test_type === "grand_test") {
      const { data: allAttempts, error: rankingError } = await supabase
        .from("user_grand_tests_attempts")
        .select("id, user_id, total_score, time_taken_minutes")
        .eq("test_id", id)
        .eq("is_completed", true)
        .order("total_score", { ascending: false })
        .order("time_taken_minutes", { ascending: true });

      if (!rankingError && allAttempts?.length > 0) {
        const total = allAttempts.length;
        const rankings = allAttempts.map((a, index) => {
          const rank = index + 1;
          const percentile =
            total > 1 ? ((total - rank) / (total - 1)) * 100 : 100;
          return {
            test_id: id,
            user_id: a.user_id,
            attempt_id: a.id,
            rank,
            score: a.total_score,
            percentile: Math.round(percentile * 100) / 100,
          };
        });

        const { error: rankingsError } = await supabase
          .from("test_rankings")
          .upsert(rankings, {
            onConflict: "test_id,user_id",
          });

        if (rankingsError)
          console.error("Error saving rankings", rankingsError);
      }
    }

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      results: {
        total_score: totalScore,
        correct_answers: correctAnswers,
        incorrect_answers: incorrectAnswers,
        unanswered: totalQuestions - answeredQuestions,
        accuracy: answeredQuestions
          ? Math.round((correctAnswers / answeredQuestions) * 100)
          : 0,
        time_taken_minutes: timeTakenMinutes,
      },
    });
  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    );
  }
}
