import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/supabase/middleware";
import { createClient } from "./supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Always update session after auth
  await updateSession(request);

  const path = request.nextUrl.pathname;
  const match = path.match(/\/grand-tests\/([^/]+)(?:\/section\/(\d+))?/);
  if (!match) return NextResponse.next();

  const testId = match[1];
  const requestedSection = match[2] ? parseInt(match[2]) : null;

  const { data: attempt } = await supabase
    .from("user_grand_tests_attempts")
    .select("current_section, is_completed")
    .eq("test_id", testId)
    .eq("user_id", user.id)
    .eq("is_completed", false)
    .maybeSingle();

  if (!attempt) return NextResponse.next();

  const currentSection = attempt.current_section || 1;
    if (
      !attempt.is_completed &&
      requestedSection &&
      requestedSection !== currentSection
    ) {
      return NextResponse.redirect(
        new URL(`/grand-tests/${testId}/section/${currentSection}`, request.url)
      );
    }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
