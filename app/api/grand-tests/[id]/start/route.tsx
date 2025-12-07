import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getExamPatternConfig, getSectionConfig } from "@/lib/constants/exam-patterns";

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
        `id, title, duration_minutes, test_type, test_mode, exam_pattern, scheduled_at, expires_at, 
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

    // Check if user has already completed this test
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

    // Check for ongoing attempt
    const { data: ongoingAttempt, error: ongoingError } = await supabase
      .from("user_grand_tests_attempts")
      .select("id, started_at, is_completed, section_times, current_section")
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

    let attempt: any;
    let currentSection = 1;

    // Get exam pattern configuration
    const examConfig = getExamPatternConfig(test.exam_pattern);

    if (ongoingAttempt) {
      attempt = ongoingAttempt;
      currentSection = attempt.current_section || 1;
    } else {
      // Initialize section_times based on exam pattern
      const sectionTimes = examConfig.sections.map((section) => ({
        section: section.sectionNumber,
        start_time: section.sectionNumber === 1 ? new Date().toISOString() : null,
        remaining_seconds: section.durationSeconds,
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
          current_section: 1,
        })
        .select("id, started_at, is_completed, section_times, current_section")
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
    const activeSection = sectionTimes.find(
      (s: any) => !s.is_submitted && s.section >= currentSection
    );
    currentSection = activeSection?.section || 1;

    // Get test questions for current section only
    const { data: questions, error: questionsError } = await supabase
      .from("grand_tests_questions")
      .select(
        `id, question_text, option_a, option_b, option_c, option_d, images,
         difficulty_level, subject_id, topic_id, question_order, marks, section_number, correct_option`
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
    const { data: existingAnswers } = await supabase
      .from("user_grand_tests_answers")
      .select("question_id, selected_option, is_marked_for_review, question_state")
      .eq("attempt_id", attempt.id)
      .eq("section_number", currentSection);

    // Create answers map
    const answersMap =
      existingAnswers?.reduce((acc: any, answer: any) => {
        acc[answer.question_id] = {
          selected_option: answer.selected_option,
          is_marked_for_review: answer.is_marked_for_review,
          question_state: answer.question_state,
        };
        return acc;
      }, {}) || {};

    // Calculate remaining time for current section
    const currentSectionData = sectionTimes.find(
      (s: any) => s.section === currentSection
    );

    const sectionConfig = getSectionConfig(test.exam_pattern, currentSection);
    let remainingSeconds = sectionConfig?.durationSeconds || 2520;

    if (currentSectionData?.start_time) {
      const startTime = new Date(currentSectionData.start_time);
      const elapsedSeconds = Math.floor(
        (now.getTime() - startTime.getTime()) / 1000
      );
      remainingSeconds = Math.max(0, (sectionConfig?.durationSeconds || 2520) - elapsedSeconds);
    }

    // Transform questions with user answers
    const questionsWithAnswers =
      questions?.map((question: any) => ({
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
        correct_option: question.correct_option,
        user_answer: answersMap[question.id] || null,
      })) || [];

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        test_id: test.id,
        test_title: test.title,
        test_type: test.test_type,
        test_mode: test.test_mode,
        exam_pattern: test.exam_pattern,
        started_at: attempt.started_at,
        duration_minutes: test.duration_minutes,
        remaining_seconds: remainingSeconds,
        current_section: currentSection,
        total_questions: test.total_questions,
        total_marks: test.total_marks,
        negative_marking: test.negative_marking,
        questions: questionsWithAnswers,
        section_times: sectionTimes,
        exam_config: examConfig,
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
