import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getExamPatternConfig } from "@/lib/constants/exam-patterns";

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
  }: { attemptId: string; sectionNumber: number } = body;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get attempt with test info
    const { data: attempt, error: attemptError } = await supabase
      .from("user_grand_tests_attempts")
      .select("id, section_times, test_id, user_id")
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

    // Get test to determine exam pattern
    const { data: test, error: testError } = await supabase
      .from("grand_tests")
      .select("exam_pattern")
      .eq("id", attempt.test_id)
      .single();

    if (testError || !test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    const examConfig = getExamPatternConfig(test.exam_pattern);
    const sectionTimes = attempt.section_times || [];

    // Mark current section as submitted
    const updatedSectionTimes = sectionTimes.map((s: any) => {
      if (Number(s.section) === Number(sectionNumber)) {
        return {
          ...s,
          is_submitted: true,
          remaining_seconds: 0,
          start_time: null,
        };
      }
      return s;
    });

    // Find next section
    const nextSection = sectionTimes.find(
      (s: any) => s.section > sectionNumber && !s.is_submitted
    );

    const isLastSection = !nextSection || sectionNumber >= examConfig.totalSections;

    // If there's a next section, start its timer
    if (nextSection) {
      const nextSectionNumber = nextSection.section;
      updatedSectionTimes.forEach((s: any) => {
        if (s.section === nextSectionNumber) {
          s.start_time = new Date().toISOString();
        }
      });
    }

    // Update attempt
    const { error: updateError } = await supabase
      .from("user_grand_tests_attempts")
      .update({
        section_times: updatedSectionTimes,
        current_section: isLastSection ? null : Number(sectionNumber) + 1,
      })
      .eq("id", attemptId);

    if (updateError) {
      console.error("Update section times error:", updateError);
      throw updateError;
    }

    console.log(`Section ${sectionNumber} submitted. Next section: ${nextSection?.section}, isLastSection: ${isLastSection}`);
    console.log('Updated section times:', JSON.stringify(updatedSectionTimes, null, 2));

    return NextResponse.json({
      message: `Section ${sectionNumber} submitted successfully`,
      nextSection: nextSection?.section || null,
      isLastSection,
    });
  } catch (error) {
    console.error("Error submitting section:", error);
    return NextResponse.json(
      { error: "Failed to submit section" },
      { status: 500 }
    );
  }
}
