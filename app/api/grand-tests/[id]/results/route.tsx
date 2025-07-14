import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const { data: rankings, error: rankingsError } = await supabase
      .from("test_rankings")
      .select(
        `
        rank, user_id, score, percentile,
        user_profiles(full_name)
      `
      )
      .eq("test_id", id)
      .order("rank");

    if (rankingsError) {
      console.error("Rankings fetch error:", rankingsError);
      return NextResponse.json(
        { error: "Failed to fetch rankings" },
        { status: 500 }
      );
    }

    const { data: stats, error: statsError } = await supabase
      .from("user_grand_tests_attempts")
      .select("total_score")
      .eq("test_id", id)
      .eq("is_completed", true);

    if (statsError) {
      console.error("Stats fetch error:", statsError);
      return NextResponse.json(
        { error: "Failed to fetch stats" },
        { status: 500 }
      );
    }

    const scores = stats.map((s) => s.total_score);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

    return NextResponse.json({
      rankings,
      stats: {
        average_score: averageScore,
        highest_score: highestScore,
        total_participants: scores.length,
      },
    });
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    );
  }
}
