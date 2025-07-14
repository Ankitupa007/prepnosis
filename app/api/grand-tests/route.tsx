// app/api/tests/[testId]/route.ts
import { createClient } from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  try {
    const { data: tests, error } = await supabase
      .from("grand_tests")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch tests" },
        { status: 500 }
      );
    }

    return NextResponse.json({ tests: tests || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
