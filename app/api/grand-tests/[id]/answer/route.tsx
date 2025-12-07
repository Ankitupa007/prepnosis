// app/api/grand-tests/[id]/answer/route.ts

import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface Answer {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  isMarkedForReview: boolean;
  sectionNumber: number;
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
    const { attemptId, answer, currentSection } = body as {
      attemptId: string;
      answer: Answer;
      currentSection: number;
    };

    // Validate that user owns this attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("user_grand_tests_attempts")
      .select("id, test_id, current_section")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: "Invalid attempt" },
        { status: 403 }
      );
    }

    // Validate section number matches current section
    if (answer.sectionNumber !== currentSection) {
      return NextResponse.json(
        { error: "Cannot answer questions from other sections" },
        { status: 400 }
      );
    }

    const { data: test, error: testError } = await supabase
      .from("grand_tests")
      .select("negative_marking, exam_pattern")
      .eq("id", id)
      .single();

    if (testError) throw testError;

    // Calculate marks based on exam pattern
    let marksAwarded = 0;
    if (answer.selectedOption !== null && answer.selectedOption !== undefined) {
      if (answer.isCorrect) {
        marksAwarded = test.exam_pattern === "NEET_PG" ? 4 : 1;
      } else if (test.negative_marking) {
        marksAwarded = test.exam_pattern === "NEET_PG" ? -1 : -0.33;
      }
    }

    // Determine question state based on answer data
    // This will be handled by the database trigger, but we can set it explicitly
    let questionState: string;
    if (answer.selectedOption === null && !answer.isMarkedForReview) {
      questionState = 'skipped';
    } else if (answer.selectedOption !== null && !answer.isMarkedForReview) {
      questionState = 'answered';
    } else if (answer.selectedOption === null && answer.isMarkedForReview) {
      questionState = 'marked_for_review';
    } else {
      questionState = 'answered_and_marked';
    }

    const userAnswerData = {
      attempt_id: attemptId,
      question_id: answer.questionId,
      selected_option: answer.selectedOption,
      is_correct: answer.isCorrect,
      marks_awarded: marksAwarded,
      is_marked_for_review: answer.isMarkedForReview,
      section_number: answer.sectionNumber,
      answered_at: new Date().toISOString(),
    };

    const { data: savedAnswer, error: answersError } = await supabase
      .from("user_grand_tests_answers")
      .upsert(userAnswerData, {
        onConflict: "attempt_id,question_id",
      })
      .select("question_state")
      .single();

    if (answersError) throw answersError;

    return NextResponse.json({
      success: true,
      questionState: savedAnswer?.question_state || questionState,
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
