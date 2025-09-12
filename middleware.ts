import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/supabase/middleware";
import { createClient } from "./supabase/server";

export async function middleware(request: NextRequest) {
  const supabase = await createClient();

  await updateSession(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // 1. Prevent logged-in users from visiting login/register
  if (user && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Protect dashboard and grand-tests
  if (path.startsWith("/dashboard") || path.startsWith("/grand-tests")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Optional: section restriction logic
    const match = path.match(/^\/grand-tests\/([^/]+)(?:\/section\/(\d+))?$/);
    if (match) {
      const testId = match[1];
      const requestedSection = match[2] ? parseInt(match[2]) : null;

      const currentSection = user.user_metadata?.current_section || 1;
      const isCompleted = user.user_metadata?.is_completed || false;

      if (!isCompleted && requestedSection && requestedSection !== currentSection) {
        return NextResponse.redirect(
          new URL(`/grand-tests/${testId}/section/${currentSection}`, request.url)
        );
      }
    }
  }

  // 3. Public routes (homepage, about, etc.) just pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/grand-tests/:path*",
  ],
};
