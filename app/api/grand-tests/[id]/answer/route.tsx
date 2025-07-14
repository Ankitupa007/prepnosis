// app/api/grand-tests/[id]/answer.ts

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

    const { data: test, error: testError } = await supabase
      .from("grand_tests")
      .select("negative_marking, exam_pattern")
      .eq("id", id)
      .single();

    if (testError) throw testError;

    const userAnswerInserts = [];
    for (const answer of answers) {
      const { question_id, selectedOption, isCorrect } = answer;
      let marksAwarded = 0;
      if (selectedOption !== null && selectedOption !== undefined) {
        if (isCorrect) {
          marksAwarded = test.exam_pattern === "NEET_PG" ? 4 : 1;
        } else if (test.negative_marking) {
          marksAwarded = -1;
        }
      }

      userAnswerInserts.push({
        attempt_id: attemptId,
        question_id,
        selected_option: selectedOption,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        answered_at: new Date().toISOString(),
      });
    }

    const { error: answersError } = await supabase
      .from("user_grand_tests_answers")
      .upsert(userAnswerInserts, {
        onConflict: "attempt_id,question_id",
      });

    if (answersError) throw answersError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    );
  }
}
