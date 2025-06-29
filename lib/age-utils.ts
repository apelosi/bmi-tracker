export function calculateAge(dateOfBirth: string | Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function formatAge(dateOfBirth: string | Date | null): string {
  if (!dateOfBirth) return "Not specified"

  const age = calculateAge(dateOfBirth)
  return `${age} years old`
}
