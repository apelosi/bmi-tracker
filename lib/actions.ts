"use server"

import { cookies } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { convertHeightToMetric, convertWeightToMetric, type SystemOfMeasurement } from "@/lib/units"

/* ───────────────────────────  AUTH  ──────────────────────────── */
export async function signIn(_prev: unknown, formData: FormData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()

  if (!email || !password) return { error: "Email and password are required" }

  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  return error ? { error: error.message } : { success: true }
}

export async function signUp(_prev: unknown, formData: FormData) {
  const email = formData.get("email")?.toString()
  const password = formData.get("password")?.toString()

  if (!email || !password) return { error: "Email and password are required" }

  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  if (data.user) {
    await supabase.from("users").insert({ id: data.user.id, onboarding_completed: false })
  }

  return { success: "Check your email to confirm your account." }
}

export async function signInWithGoogle() {
  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("/supabase", "")}/auth/callback`,
    },
  })

  if (error) redirect("/auth/login?error=oauth_error")
  if (data.url) redirect(data.url)
}

export async function signInWithFacebook() {
  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("/supabase", "")}/auth/callback`,
    },
  })

  if (error) redirect("/auth/login?error=oauth_error")
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()
  redirect("/auth/login")
}

/* ────────────────────────  ONBOARDING  ───────────────────────── */
export async function completeOnboarding(prevState: any, formData: FormData) {
  try {
    console.log("🚀 Onboarding action started")

    const supabase = createServerActionClient({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      console.log("❌ No user found")
      return { error: "Not authenticated" }
    }

    console.log("✅ User found:", user.id)

    // Get form values
    const name = formData.get("name")?.toString()
    const system = formData.get("system")?.toString() as SystemOfMeasurement

    console.log("📝 Form values:", { name, system })

    if (!name || !system) {
      console.log("❌ Missing required fields")
      return { error: "Name and system are required" }
    }

    // Handle height
    let heightInCm = 170 // default fallback

    if (system === "us" || system === "uk") {
      const feet = formData.get("heightFeet")?.toString()
      const inches = formData.get("heightInches")?.toString()

      if (feet && inches) {
        heightInCm = convertHeightToMetric({ feet: Number.parseInt(feet), inches: Number.parseInt(inches) }, system)
      }
    } else {
      const height = formData.get("height")?.toString()
      if (height) {
        heightInCm = Number.parseFloat(height)
      }
    }

    console.log("📏 Height:", heightInCm)

    // Prepare data
    const updateData = {
      name,
      system_of_measurement: system,
      height: heightInCm,
      date_of_birth: formData.get("dateOfBirth")?.toString() || null,
      sex: formData.get("sex")?.toString() || "not specified",
      onboarding_completed: true,
    }

    console.log("💾 Updating with:", updateData)

    // Update database
    const { error } = await supabase.from("users").upsert({ id: user.id, ...updateData }, { onConflict: "id" })

    if (error) {
      console.error("❌ Database error:", error)
      return { error: `Failed to save: ${error.message}` }
    }

    console.log("✅ Database updated successfully")

    // Verify the update worked
    const { data: updatedProfile, error: fetchError } = await supabase
      .from("users")
      .select("id, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle()

    if (fetchError) {
      console.error("❌ Failed to verify update:", fetchError)
      return { error: "Failed to verify profile update" }
    }

    if (!updatedProfile) {
      console.error("❌ No user row found after upsert")
      return { error: "Failed to create user profile – please try again." }
    }

    console.log("✅ Profile verified:", updatedProfile)

    // Revalidate paths
    revalidatePath("/")
    revalidatePath("/onboarding")

    console.log("🎯 About to redirect to home page...")

    // Use server-side redirect
    redirect("/")
  } catch (error) {
    console.error("💥 Unexpected error in onboarding:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

/* ────────────────────────  BMI ENTRIES  ──────────────────────── */
export async function addBMIEntry(_prev: unknown, formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase.from("users").select("system_of_measurement").eq("id", user.id).single()

  const system = (profile?.system_of_measurement || "metric") as SystemOfMeasurement
  const date = formData.get("date")?.toString()
  if (!date) return { error: "Date is required" }

  /* height */
  let heightCm = 0
  if (system === "us" || system === "uk") {
    const feet = Number(formData.get("heightFeet") || 0)
    const inches = Number(formData.get("heightInches") || 0)
    heightCm = convertHeightToMetric({ feet, inches }, system)
  } else {
    heightCm = Number(formData.get("height") || 0)
  }

  /* weight */
  let weightKg = 0
  if (system === "uk") {
    const stones = Number(formData.get("weightStones") || 0)
    const pounds = Number(formData.get("weightPounds") || 0)
    weightKg = convertWeightToMetric({ stones, pounds }, system)
  } else {
    weightKg = convertWeightToMetric(Number(formData.get("weight") || 0), system)
  }

  const { error } = await supabase.from("bmi_entries").insert({
    user_id: user.id,
    created_at: date,
    height: heightCm,
    weight: weightKg,
  })

  if (error) return { error: error.message }

  revalidatePath("/")
  return { success: true }
}

/* ────────────────────────  UPDATE BMI ENTRY  ───────────────────── */
export async function updateBMIEntry(_prev: unknown, formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const id = formData.get("id")?.toString()
  const date = formData.get("date")?.toString()
  if (!id || !date) return { error: "ID and date are required" }

  const { data: profile } = await supabase.from("users").select("system_of_measurement").eq("id", user.id).single()
  const system = (profile?.system_of_measurement || "metric") as SystemOfMeasurement

  /* height */
  let heightCm = 0
  if (system === "us" || system === "uk") {
    const feet = Number(formData.get("heightFeet") || 0)
    const inches = Number(formData.get("heightInches") || 0)
    heightCm = convertHeightToMetric({ feet, inches }, system)
  } else {
    heightCm = Number(formData.get("height") || 0)
  }

  /* weight */
  let weightKg = 0
  if (system === "uk") {
    const stones = Number(formData.get("weightStones") || 0)
    const pounds = Number(formData.get("weightPounds") || 0)
    weightKg = convertWeightToMetric({ stones, pounds }, system)
  } else {
    weightKg = convertWeightToMetric(Number(formData.get("weight") || 0), system)
  }

  const { error } = await supabase
    .from("bmi_entries")
    .update({
      created_at: date,
      height: heightCm,
      weight: weightKg,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath("/")
  return { success: true }
}

/* ─────────────────────────  DELETE BMI ENTRY  ──────────────────── */
export async function deleteBMIEntry(id: string) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { error } = await supabase.from("bmi_entries").delete().eq("id", id).eq("user_id", user.id)
  if (error) throw new Error(error.message)

  revalidatePath("/")
}
