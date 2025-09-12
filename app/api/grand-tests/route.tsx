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

    // 1️⃣ Fetch all active grand tests (global)
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
        created_at
      `
      )
      .eq("test_type", "grand_test")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (testsError) {
      console.error("Tests fetch error:", testsError);
      return NextResponse.json(
        { error: "Failed to fetch tests" },
        { status: 500 }
      );
    }

    // 2️⃣ Fetch attempts only for this user
    const { data: attempts, error: attemptsError } = await supabase
      .from("user_grand_tests_attempts")
      .select(
        `
        id,
        test_id,
        user_id,
        total_score,
        correct_answers,
        submitted_at,
        time_taken_minutes,
        is_completed
      `
      )
      .eq("user_id", user.id)
      .eq("is_completed", true);

    if (attemptsError) {
      console.error("Attempts fetch error:", attemptsError);
      return NextResponse.json(
        { error: "Failed to fetch attempts" },
        { status: 500 }
      );
    }

    // 3️⃣ Merge tests + attempts
    const attemptsByTest = new Map<string, typeof attempts>();
    for (const attempt of attempts) {
      if (!attemptsByTest.has(attempt.test_id)) {
        attemptsByTest.set(attempt.test_id, []);
      }
      attemptsByTest.get(attempt.test_id)!.push(attempt);
    }

    const transformedTests = tests?.map((test) => {
      const userAttempts = attemptsByTest.get(test.id) || [];

      const formattedAttempts = userAttempts.map((attempt) => ({
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
        exam_pattern: test.exam_pattern,
        total_questions: test.total_questions,
        total_marks: test.total_marks,
        created_at: test.created_at,
        attempts: formattedAttempts,
        has_attempted: formattedAttempts.length > 0, // ✅ easy check
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
