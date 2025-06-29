import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AuthCallback() {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?error=callback_error")
  }

  // Check if user profile exists, if not create it
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    // Create user profile for OAuth users
    const { error } = await supabase.from("users").insert({
      id: user.id,
      onboarding_completed: false,
    })

    if (error) {
      console.error("Profile creation error:", error)
    }

    // Redirect to onboarding
    redirect("/onboarding")
  }

  // If profile exists but onboarding not completed, redirect to onboarding
  if (!profile.onboarding_completed) {
    redirect("/onboarding")
  }

  // Otherwise redirect to home
  redirect("/")
}
