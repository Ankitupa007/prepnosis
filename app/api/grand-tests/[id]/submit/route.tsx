// app/api/grand-tests/[id]/submit/route.ts

import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { calculateMarks } from "@/lib/constants/exam-patterns";

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
    const { attemptId } = body;

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
      .select("negative_marking, test_type, exam_pattern, total_questions")
      .eq("id", id)
      .single();

    if (testError) throw testError;

    // Get all answers for this attempt
    const { data: allAnswers, error: answersError } = await supabase
      .from("user_grand_tests_answers")
      .select("selected_option, is_correct, marks_awarded")
      .eq("attempt_id", attemptId);

    if (answersError) throw answersError;

    // Calculate results
    const totalQuestions = test.total_questions;
    const answeredQuestions = allAnswers?.filter(
      (a: any) => a.selected_option !== null
    ).length || 0;
    const correctAnswers = allAnswers?.filter((a: any) => a.is_correct).length || 0;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const unanswered = totalQuestions - answeredQuestions;

    // Calculate total score using exam pattern
    const totalScore = calculateMarks(
      test.exam_pattern,
      correctAnswers,
      incorrectAnswers
    );

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
        unanswered: unanswered,
        time_taken_minutes: timeTakenMinutes,
      })
      .eq("id", attemptId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Calculate rankings
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
        const rankings = allAttempts.map((a: any, index: number) => {
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
        unanswered: unanswered,
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
