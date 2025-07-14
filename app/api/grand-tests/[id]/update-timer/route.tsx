import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
    const { attemptId, currentSection, remainingSeconds } = body;

    const { data: attempt, error: attemptError } = await supabase
      .from("user_grand_tests_attempts")
      .select("id, section_times, is_completed")
      .eq("id", attemptId)
      .eq("user_id", user.id)
      .eq("is_completed", false)
      .maybeSingle();

    if (attemptError) throw attemptError;
    if (!attempt)
      return NextResponse.json(
        { error: "No active attempt found" },
        { status: 406 }
      );

    const sectionTimes = attempt.section_times || [];
    const updatedSectionTimes = sectionTimes.map((s: any) =>
      s.section === currentSection
        ? { ...s, remaining_seconds: remainingSeconds }
        : s
    );

    const { error: updateError } = await supabase
      .from("user_grand_tests_attempts")
      .update({ section_times: updatedSectionTimes })
      .eq("id", attempt.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating timer:", error);
    return NextResponse.json(
      { error: "Failed to update timer" },
      { status: 500 }
    );
  }
}
