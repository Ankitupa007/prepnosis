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

    return NextResponse.json({ rankings });
  } catch (error) {
    console.error("Error fetching rankings:", error);
    return NextResponse.json(
      { error: "Failed to fetch rankings" },
      { status: 500 }
    );
  }
}
