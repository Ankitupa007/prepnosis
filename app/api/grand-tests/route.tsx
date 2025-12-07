import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the logged-in user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch tests with user attempts in a single query
    // We use the 'tests' table and join 'user_test_attempts'
    // We filter attempts by the current user
    const { data: tests, error: testsError } = await supabase
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
      .eq("user_grand_tests_attempts.user_id", user.id) // Filter the joined attempts
      .eq("user_grand_tests_attempts.is_completed", true) // Only completed attempts
      .order("created_at", { ascending: false });

    if (testsError) {
      console.error("Tests fetch error:", testsError);
      return NextResponse.json(
        { error: "Failed to fetch tests" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected frontend format
    const transformedTests = tests?.map((test) => {
      // The attempts are now nested in the test object
      // We need to cast it because TypeScript might not know the shape of the joined data automatically
      const userAttempts = (test.user_grand_tests_attempts as any[]) || [];

      const formattedAttempts = userAttempts.map((attempt) => ({
        id: attempt.id,
        score: attempt.total_score,
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
        exam_pattern: test.exam_pattern,
        total_questions: test.total_questions,
        total_marks: test.total_marks,
        created_at: test.created_at,
        attempts: formattedAttempts,
        has_attempted: formattedAttempts.length > 0,
        _count: {
          attempts: formattedAttempts.length,
        },
      };
    });

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
