import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  console.log("🔒 Middleware running for:", request.nextUrl.pathname)

  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    console.log("⚠️ Supabase not configured, skipping auth")
    return NextResponse.next({
      request,
    })
  }

  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    console.log("🔄 Processing auth callback")
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to home page after successful auth
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("👤 Session status:", session ? "authenticated" : "not authenticated")

  // Define routes that don't require authentication
  const isPublicRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname === "/auth/callback"

  // Define routes that require authentication but have special handling
  const isOnboardingRoute = request.nextUrl.pathname === "/onboarding"

  if (!isPublicRoute && !session) {
    console.log("🚫 No session, redirecting to login")
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // For onboarding route, allow access if user is authenticated
  if (isOnboardingRoute && session) {
    console.log("✅ Allowing access to onboarding")
    return res
  }

  // For home page, check if onboarding is completed
  if (request.nextUrl.pathname === "/" && session) {
    console.log("🏠 Checking onboarding status for home page")
    try {
      const { data: profile } = await supabase
        .from("users")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single()

      if (!profile?.onboarding_completed) {
        console.log("📝 Onboarding not completed, redirecting to onboarding")
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }

      console.log("✅ Onboarding completed, allowing access to home")
    } catch (error) {
      console.error("❌ Error checking onboarding status:", error)
    }
  }

  console.log("✅ Middleware allowing request to continue")
  return res
}
