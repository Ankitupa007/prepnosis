// api/grand-tests/[id]/route.ts
import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
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
        negative_marking,
        sections,
        scheduled_at,
        expires_at,
        created_at,
        created_by,
        share_code
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (testError) {
      console.error("Test fetch error:", testError);
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Get the user's attempt to determine current section
    const { data: attempt, error: attemptError } = await supabase
      .from("user_grand_tests_attempts")
      .select(
        "id, started_at, submitted_at, is_completed, total_score, section_times, current_section"
      )
      .eq("test_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (attemptError) {
      console.error("Attempt fetch error:", attemptError);
    }

    let currentSection = attempt?.current_section || 1;
    let remainingSeconds = 2520;
    if (Array.isArray(attempt?.section_times)) {
      const activeSection = attempt.section_times.find(
        (s: any) => s.remaining_seconds > 0 && s.start_time && !s.is_submitted
      );
      currentSection = activeSection?.section || 1;
      if (activeSection?.start_time) {
        const startTime = new Date(activeSection.start_time);
        const elapsedSeconds = Math.floor(
          (new Date().getTime() - startTime.getTime()) / 1000
        );
        remainingSeconds = Math.max(
          0,
          activeSection.remaining_seconds - elapsedSeconds
        );
      }
    }

    // Get test questions for current section
    let questionsQuery = supabase
      .from("grand_tests_questions")
      .select(
        `
        id,
        question_text,
        explanation,
        option_a,
        option_b,
        option_c,
        option_d,
        images,
        correct_option,
        difficulty_level,
        subject_id,
        topic_id,
        question_order,
        marks,
        section_number,
        user_grand_tests_answers (
          selected_option
        )
      `
      )
      .eq("test_id", id)
      .eq("is_active", true);

    if (attempt?.id) {
      questionsQuery = questionsQuery.eq(
        "user_grand_tests_answers.attempt_id",
        attempt.id
      );
    } else {
      questionsQuery = questionsQuery.is(
        "user_grand_tests_answers.attempt_id",
        null
      );
    }

    const { data: testQuestions, error: questionsError } =
      await questionsQuery.order("question_order");

    if (questionsError) {
      console.error("Questions fetch error:", questionsError);
      throw questionsError;
    }

    // Transform questions
    const transformedQuestions =
      testQuestions?.map((question) => ({
        id: question.id,
        question_id: question.id,
        question_order: question.question_order,
        marks: question.marks,
        section_number: question.section_number,
        question: {
          id: question.id,
          question_text: question.question_text,
          explanation: question.explanation,
          option_a: question.option_a,
          option_b: question.option_b,
          option_c: question.option_c,
          option_d: question.option_d,
          images: question.images,
          correct_option: question.correct_option,
          difficulty_level: question.difficulty_level,
          subject_id: question.subject_id,
          topic_id: question.topic_id,
        },
        user_answer:
          question.user_grand_tests_answers &&
          question.user_grand_tests_answers.length > 0
            ? {
                selected_option:
                  question.user_grand_tests_answers[0].selected_option,
              }
            : null,
      })) || [];

    return NextResponse.json({
      test: {
        ...test,
        user_attempt: attempt,
      },
      questions: transformedQuestions,
      current_section: currentSection,
      remaining_seconds: remainingSeconds,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}
