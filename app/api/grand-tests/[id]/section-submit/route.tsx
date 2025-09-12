import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();
  const {
    attemptId,
    sectionNumber,
    answers,
  }: { attemptId: string; sectionNumber: number; answers: any } = body;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: attempt, error: attemptError } = await supabase
      .from("user_grand_tests_attempts")
      .select("id, section_times, test_id")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .single();

    if (attemptError || !attempt) {
      console.error("Attempt fetch error:", attemptError);
      return NextResponse.json(
        { error: "No active attempt found" },
        { status: 406 }
      );
    }
    console.log(sectionNumber, attempt.section_times);


    const sectionTimes = attempt.section_times || [];
    const currentSectionData = sectionTimes.find(
      (s: any) => s.section === sectionNumber
    );
    const now = new Date();
    const elapsedSeconds = currentSectionData?.start_time
      ? Math.floor(
          (now.getTime() - new Date(currentSectionData.start_time).getTime()) /
            1000
        )
      : 0;

    const remainingSeconds = Math.max(0, 2520 - elapsedSeconds);

    let updatedSectionTimes = sectionTimes.map((s: any) => {
      if (Number(s.section) === Number(sectionNumber)) {
        return {
          ...s,
          is_submitted: true,
          remaining_seconds: 0,
          start_time: null, // Section done, cleanup
        };
      }
      return s;
    });

    console.log(updatedSectionTimes);
    
    if (!updatedSectionTimes) {
      return NextResponse.json(
        { error: "Section already submitted or invalid" },
        { status: 400 }
      );
    }

    const userAnswerInserts = answers.map((answer: any) => ({
      attempt_id: attemptId,
      question_id: answer.questionId,
      selected_option: answer.selectedOption,
      is_correct: answer.isCorrect,
      marks_awarded: answer.isCorrect
        ? 4
        : answer.selectedOption !== null
        ? -1
        : 0,
      is_marked_for_review: answer.isMarkedForReview || false,
      answered_at: new Date().toISOString(),
    }));

    const { error: answersError } = await supabase
      .from("user_grand_tests_answers")
      .upsert(userAnswerInserts, { onConflict: "attempt_id,question_id" });

    if (answersError) {
      console.error("Answers upsert error:", answersError);
      throw answersError;
    }

    const nextSection = sectionTimes.find(
      (s: any) => s.section > sectionNumber && !s.is_submitted
    );
    const isLastSection = !nextSection;
    if (nextSection) {
      const nextSectionNumber = nextSection.section;
      updatedSectionTimes = updatedSectionTimes.map((s: any) =>
        s.section === nextSectionNumber
          ? { ...s, start_time: new Date().toISOString() }
          : s
      );
    }

    const { error: updateError } = await supabase
      .from("user_grand_tests_attempts")
      .update({
        section_times: updatedSectionTimes,
        current_section: isLastSection ? null : Number(sectionNumber) + 1,
        is_completed: false,
        submitted_at: null,
      })
      .eq("id", attemptId);

    if (updateError) {
      console.error("Update section times error:", updateError);
      throw updateError;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: {
        current_section: isLastSection ? null : Number(sectionNumber) + 1,
        is_completed: false,
        submitted_at: null,
      },
});


    return NextResponse.json({
      message: `Section ${sectionNumber} submitted successfully`,
      nextSection: nextSection?.section || null,
    });
  } catch (error) {
    console.error("Error submitting section:", error);
    return NextResponse.json(
      { error: "Failed to submit section" },
      { status: 500 }
    );
  }
}
