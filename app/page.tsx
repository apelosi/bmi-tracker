import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import BMIDashboard from "@/components/bmi-dashboard"

export default async function Home() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4">Connect Supabase to get started</h1>
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

  // Get user profile
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // If user hasn't completed onboarding, redirect
  if (!profile || !profile.onboarding_completed) {
    redirect("/onboarding")
  }

  // Get BMI entries
  const { data: entries = [] } = await supabase
    .from("bmi_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Use name from profile, fallback to auth metadata or email
  const userName = profile.name || user.user_metadata?.name || user.email?.split("@")[0]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header userEmail={user.email} userName={userName} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your BMI Journey</h2>
          <p className="text-gray-600">Track your health metrics over time</p>
        </div>

        <BMIDashboard entries={entries} user={profile} />
      </main>

      <Footer />
    </div>
  )
}
