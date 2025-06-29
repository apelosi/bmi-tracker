export type SystemOfMeasurement = "metric" | "us" | "uk"

export interface UnitLabels {
  height: string
  weight: string
}

export interface HeightInFeetInches {
  feet: number
  inches: number
}

export interface WeightInStonePounds {
  stones: number
  pounds: number
}

export function getUnitLabels(system: SystemOfMeasurement): UnitLabels {
  switch (system) {
    case "us":
      return { height: "ft/in", weight: "lbs" }
    case "uk":
      return { height: "ft/in", weight: "st/lbs" }
    default:
      return { height: "cm", weight: "kg" }
  }
}

// Convert cm to feet and inches
export function convertHeightFromMetricToFeetInches(heightCm: number): HeightInFeetInches {
  const totalInches = heightCm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return { feet, inches }
}

// Convert feet and inches to cm
export function convertHeightFromFeetInchesToMetric(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches
  return Math.round(totalInches * 2.54 * 100) / 100 // Round to 2 decimal places
}

// Convert kg to stones and pounds
export function convertWeightFromMetricToStonePounds(weightKg: number): WeightInStonePounds {
  const totalPounds = weightKg * 2.20462
  const stones = Math.floor(totalPounds / 14)
  const pounds = Math.round(totalPounds % 14)
  return { stones, pounds }
}

// Convert stones and pounds to kg
export function convertWeightFromStonePoundsToMetric(stones: number, pounds: number): number {
  const totalPounds = stones * 14 + pounds
  return Math.round((totalPounds / 2.20462) * 100) / 100 // Round to 2 decimal places
}

// Convert from metric (cm) to user's preferred height unit
export function convertHeightFromMetric(heightCm: number, system: SystemOfMeasurement): number | HeightInFeetInches {
  switch (system) {
    case "us":
    case "uk":
      return convertHeightFromMetricToFeetInches(heightCm)
    default:
      return heightCm
  }
}

// Convert from user's preferred height unit to metric (cm)
export function convertHeightToMetric(height: number | HeightInFeetInches, system: SystemOfMeasurement): number {
  switch (system) {
    case "us":
    case "uk":
      if (typeof height === "object") {
        return convertHeightFromFeetInchesToMetric(height.feet, height.inches)
      }
      // Fallback for old decimal feet format
      return Math.round(height * 30.48 * 100) / 100
    default:
      return typeof height === "number" ? height : 0
  }
}

// Convert from metric (kg) to user's preferred weight unit
export function convertWeightFromMetric(weightKg: number, system: SystemOfMeasurement): number | WeightInStonePounds {
  switch (system) {
    case "us":
      return Math.round(weightKg * 2.20462 * 100) / 100 // Convert to lbs
    case "uk":
      return convertWeightFromMetricToStonePounds(weightKg)
    default:
      return weightKg
  }
}

// Convert from user's preferred weight unit to metric (kg)
export function convertWeightToMetric(weight: number | WeightInStonePounds, system: SystemOfMeasurement): number {
  switch (system) {
    case "us":
      return typeof weight === "number" ? Math.round((weight / 2.20462) * 100) / 100 : 0
    case "uk":
      if (typeof weight === "object") {
        return convertWeightFromStonePoundsToMetric(weight.stones, weight.pounds)
      }
      // Fallback for old stone format
      return typeof weight === "number" ? Math.round(weight * 6.35029 * 100) / 100 : 0
    default:
      return typeof weight === "number" ? weight : 0
  }
}

// Get placeholder values for height input
export function getHeightPlaceholder(system: SystemOfMeasurement): { feet?: string; inches?: string; cm?: string } {
  switch (system) {
    case "us":
    case "uk":
      return { feet: "5", inches: "8" } // 5'8"
    default:
      return { cm: "170" } // 170 cm
  }
}

// Get placeholder values for weight input
export function getWeightPlaceholder(system: SystemOfMeasurement): {
  stones?: string
  pounds?: string
  single?: string
} {
  switch (system) {
    case "us":
      return { single: "150" } // 150 lbs
    case "uk":
      return { stones: "11", pounds: "5" } // 11st 5lbs
    default:
      return { single: "70" } // 70 kg
  }
}

// Format height for display
export function formatHeightForDisplay(heightCm: number, system: SystemOfMeasurement): string {
  switch (system) {
    case "us":
    case "uk": {
      const { feet, inches } = convertHeightFromMetricToFeetInches(heightCm)
      return `${feet}'${inches}"`
    }
    default:
      return `${heightCm} cm`
  }
}

// Format weight for display
export function formatWeightForDisplay(weightKg: number, system: SystemOfMeasurement): string {
  switch (system) {
    case "us":
      return `${Math.round(weightKg * 2.20462 * 100) / 100} lbs`
    case "uk": {
      const { stones, pounds } = convertWeightFromMetricToStonePounds(weightKg)
      return `${stones}st ${pounds}lbs`
    }
    default:
      return `${weightKg} kg`
  }
}
