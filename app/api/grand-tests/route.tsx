// app/api/tests/user/[userId]/route.ts

import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    // Verify the authenticated user matches the requested userId
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's custom tests with related data
    const { data: tests, error } = await supabase
      .from("grand_tests")
      .select(
        `
        id,
        title,
        description,
        test_type,
        test_mode,
        exam_pattern,
        total_questions,
        total_marks,
        duration_minutes,
        created_at,
        test_rankings(
            id,
            rank,
            score,
            percentile
        ),
        user_grand_tests_attempts(
          id,
          total_score,
          correct_answers,
          submitted_at,
          time_taken_minutes,
          is_completed
        )
      `
      )
      .eq("test_type", "grand_test")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch tests" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedTests =
      tests?.map((test) => {
        // Transform attempts data
        const attempts = test.user_grand_tests_attempts
          .filter((attempt) => attempt.is_completed)
          .map((attempt) => ({
            id: attempt.id,
            score: Math.round(
              (attempt.correct_answers / test.total_questions) * 100
            ),
            total_questions: test.total_questions,
            correct_answers: attempt.correct_answers,
            completed_at: attempt.submitted_at,
            time_taken: attempt.time_taken_minutes,
          }));

        return {
          id: test.id,
          title: test.title,
          description: test.description,
          test_mode: test.test_mode,
          total_questions: test.total_questions,
          total_marks: test.total_marks,
          created_at: test.created_at,
          attempts: attempts,
          _count: {
            attempts: attempts.length,
          },
        };
      }) || [];

    return NextResponse.json({
      tests: transformedTests,
      total: transformedTests.length,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
