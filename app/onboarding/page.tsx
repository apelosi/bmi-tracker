import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import OnboardingForm from "@/components/onboarding-form"

export default async function OnboardingPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center auth-background">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase.from("users").select("onboarding_completed").eq("id", user.id).single()

  if (profile?.onboarding_completed === true) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center auth-background px-4 py-12 sm:px-6 lg:px-8">
      <OnboardingForm />
    </div>
  )
}
