import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Define interfaces for TypeScript
interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty_level: string;
  subject_id: string;
  topic_id: string;
}

interface TestQuestion {
  id: string;
  question_order: number;
  marks: number;
  section_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  images: string[];
  difficulty_level: string;
  subject_id: string;
  topic_id: string;
}

interface Test {
  id: string;
  title: string;
  duration_minutes: number;
  test_type: string;
  test_mode: string;
  scheduled_at: string | null;
  expires_at: string | null;
  total_questions: number;
  total_marks: number;
  negative_marking: number;
}

interface UserAttempt {
  id: string;
  started_at: string;
  is_completed: boolean;
  section_times: any;
}

interface UserAnswer {
  question_id: string;
  selected_option: number;
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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if test exists and is active
    const { data: test, error: testError } = await supabase
      .from("grand_tests")
      .select(
        `id, title, duration_minutes, test_type, test_mode, scheduled_at, expires_at, 
         total_questions, total_marks, negative_marking`
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (testError || !test) {
      console.error("Test fetch error:", testError);
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Check if test is scheduled and available
    const now = new Date();
    if (test.scheduled_at && new Date(test.scheduled_at) > now) {
      return NextResponse.json(
        { error: "Test has not started yet" },
        { status: 412 }
      );
    }

    if (test.expires_at && new Date(test.expires_at) < now) {
      return NextResponse.json({ error: "Test has expired" }, { status: 410 });
    }

    // Check if user has already completed this test (for grand_test type)
    if (test.test_type === "grand_test") {
      const { data: existingAttempt } = await supabase
        .from("user_grand_tests_attempts")
        .select("id")
        .eq("test_id", id)
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .maybeSingle();

      if (existingAttempt) {
        return NextResponse.json(
          { error: "You have already completed this test" },
          { status: 400 }
        );
      }
    }

    // Check for ongoing attempt
    const { data: ongoingAttempt, error: ongoingError } = await supabase
      .from("user_grand_tests_attempts")
      .select("id, started_at, is_completed, section_times")
      .eq("test_id", id)
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .maybeSingle();

    if (ongoingError) {
      console.error("Ongoing attempt fetch error:", ongoingError);
      return NextResponse.json(
        { error: "Failed to check ongoing attempt" },
        { status: 500 }
      );
    }

    let attempt: UserAttempt;
    let currentSection = 1;

    if (ongoingAttempt) {
      // Check if ongoing attempt has exceeded time limit for current section
      const sectionTimes = ongoingAttempt.section_times || [];
      const currentSectionData = sectionTimes.find(
        (s: any) => s.section === currentSection
      );
      if (currentSectionData && currentSectionData.remaining_seconds <= 0) {
        // Move to next section or complete test
        currentSection = Math.min(currentSection + 1, 5);
        if (currentSection > 5) {
          await supabase
            .from("user_grand_tests_attempts")
            .update({
              is_completed: true,
              submitted_at: new Date().toISOString(),
              auto_submitted: true,
            })
            .eq("id", ongoingAttempt.id);
          return NextResponse.json(
            { error: "Test time has expired" },
            { status: 408 }
          );
        }
      }
      attempt = ongoingAttempt;
    } else {
      // Initialize section_times for new attempt
      const sectionTimes = Array.from({ length: 5 }, (_, i) => ({
        section: i + 1,
        start_time: i === 0 ? new Date().toISOString() : null,
        remaining_seconds: 2520, // 42 minutes
        is_submitted: false,
      }));

      // Create new attempt
      const { data: newAttempt, error: newAttemptError } = await supabase
        .from("user_grand_tests_attempts")
        .insert({
          user_id: user.id,
          test_id: id,
          started_at: new Date().toISOString(),
          section_times: sectionTimes,
        })
        .select("id, started_at, is_completed, section_times")
        .single();

      if (newAttemptError) {
        console.error("New attempt creation error:", newAttemptError);
        return NextResponse.json(
          { error: "Failed to create attempt" },
          { status: 500 }
        );
      }
      attempt = newAttempt;
    }

    // Get current section from section_times
    const sectionTimes = attempt.section_times || [];
    currentSection =
      sectionTimes.find((s: any) => s.remaining_seconds > 0 && s.start_time)
        ?.section || 1;

    // Get test questions for current section
    const { data: questions, error: questionsError } = await supabase
      .from("grand_tests_questions")
      .select(
        `id, question_text, option_a, option_b, option_c, option_d, images,
         difficulty_level, subject_id, topic_id, question_order, marks, section_number`
      )
      .eq("test_id", id)
      .eq("is_active", true)
      .eq("section_number", currentSection)
      .order("question_order");

    if (questionsError) {
      console.error("Questions fetch error:", questionsError);
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    // Get existing answers for current section
    const { data: existingAnswers, error: answersError } = await supabase
      .from("user_grand_tests_answers")
      .select("question_id, selected_option, is_marked_for_review")
      .eq("attempt_id", attempt.id);

    if (answersError) {
      console.error("Answers fetch error:", answersError);
      return NextResponse.json(
        { error: "Failed to fetch answers" },
        { status: 500 }
      );
    }

    // Create answers map
    const answersMap =
      existingAnswers?.reduce((acc, answer: UserAnswer) => {
        acc[answer.question_id] = {
          selected_option: answer.selected_option,
          is_marked_for_review: answer.is_marked_for_review,
        };
        return acc;
      }, {} as Record<string, { selected_option: number; is_marked_for_review: boolean }>) ||
      {};

    // Calculate remaining time for current section
    const currentSectionData = sectionTimes.find(
      (s: any) => s.section === currentSection
    );
    let is_submitted: boolean = false;
    let remainingSeconds = currentSectionData?.remaining_seconds || 2520;
    if (currentSectionData?.start_time) {
      const startTime = new Date(currentSectionData.start_time);
      const elapsedSeconds = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000
      );
      remainingSeconds = Math.max(0, 2520 - elapsedSeconds);
      if (remainingSeconds < 1) {
        is_submitted = true;
      }
    }

    // Transform questions with user answers
    const questionsWithAnswers =
      questions?.map((question: TestQuestion) => ({
        id: question.id,
        question_text: question.question_text,
        option_a: question.option_a,
        option_b: question.option_b,
        option_c: question.option_c,
        option_d: question.option_d,
        images: question.images,
        difficulty_level: question.difficulty_level,
        subject_id: question.subject_id,
        topic_id: question.topic_id,
        question_order: question.question_order,
        marks: question.marks,
        section_number: question.section_number,
        user_answer: answersMap[question.id] || null,
      })) || [];

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        test_id: test.id,
        test_title: test.title,
        test_type: test.test_type,
        test_mode: test.test_mode,
        started_at: attempt.started_at,
        duration_minutes: test.duration_minutes,
        remaining_seconds: remainingSeconds,
        current_section: currentSection,
        total_questions: test.total_questions,
        total_marks: test.total_marks,
        negative_marking: test.negative_marking,
        questions: questionsWithAnswers,
        section_times: sectionTimes,
      },
    });
  } catch (error) {
    console.error("Error starting test:", error);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    );
  }
}
