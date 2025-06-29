"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { addBMIEntry, updateBMIEntry } from "@/lib/actions"
import {
  getUnitLabels,
  convertHeightFromMetric,
  convertWeightFromMetric,
  getHeightPlaceholder,
  getWeightPlaceholder,
  type SystemOfMeasurement,
  type HeightInFeetInches,
  type WeightInStonePounds,
} from "@/lib/units"

interface BMIEntry {
  id: string
  created_at: string
  height: number
  weight: number
  bmi: number
}

interface BMIEntryModalProps {
  isOpen: boolean
  onClose: () => void
  entry?: BMIEntry
  userHeight?: number
  systemOfMeasurement?: SystemOfMeasurement
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Updating..." : "Adding..."}
        </>
      ) : isEditing ? (
        "Update Entry"
      ) : (
        "Add Entry"
      )}
    </Button>
  )
}

export default function BMIEntryModal({
  isOpen,
  onClose,
  entry,
  userHeight = 170,
  systemOfMeasurement = "metric",
}: BMIEntryModalProps) {
  const isEditing = !!entry
  const [state, formAction] = useActionState(isEditing ? updateBMIEntry : addBMIEntry, null)

  // Close modal on success
  if (state?.success) {
    onClose()
  }

  const today = new Date().toISOString().split("T")[0]
  const units = getUnitLabels(systemOfMeasurement)
  const isImperialHeight = systemOfMeasurement === "us" || systemOfMeasurement === "uk"
  const isUKWeight = systemOfMeasurement === "uk"

  // Convert values for display
  const displayHeight = entry
    ? convertHeightFromMetric(entry.height, systemOfMeasurement)
    : convertHeightFromMetric(userHeight, systemOfMeasurement)

  const displayWeight = entry ? convertWeightFromMetric(entry.weight, systemOfMeasurement) : undefined

  const heightPlaceholder = getHeightPlaceholder(systemOfMeasurement)
  const weightPlaceholder = getWeightPlaceholder(systemOfMeasurement)

  // For imperial height, extract feet and inches
  let defaultFeet = ""
  let defaultInches = ""
  let defaultHeightCm = ""

  if (isImperialHeight && typeof displayHeight === "object") {
    const feetInches = displayHeight as HeightInFeetInches
    defaultFeet = feetInches.feet.toString()
    defaultInches = feetInches.inches.toString()
  } else if (!isImperialHeight && typeof displayHeight === "number") {
    defaultHeightCm = displayHeight.toString()
  }

  // For UK weight, extract stones and pounds
  let defaultStones = ""
  let defaultPounds = ""
  let defaultWeight = ""

  if (isUKWeight && typeof displayWeight === "object") {
    const stonePounds = displayWeight as WeightInStonePounds
    defaultStones = stonePounds.stones.toString()
    defaultPounds = stonePounds.pounds.toString()
  } else if (!isUKWeight && typeof displayWeight === "number") {
    defaultWeight = displayWeight.toString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit BMI Entry" : "Add New BMI Entry"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {isEditing && <input type="hidden" name="id" value={entry.id} />}

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={entry?.created_at || today}
              required
              className="bg-white border-gray-300 text-gray-900 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Height</Label>
              {isImperialHeight ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="heightFeet" className="text-xs text-gray-500">
                      Feet
                    </Label>
                    <Input
                      id="heightFeet"
                      name="heightFeet"
                      type="number"
                      min="0"
                      max="8"
                      defaultValue={defaultFeet}
                      placeholder={heightPlaceholder.feet}
                      required
                      className="bg-white border-gray-300 text-gray-900 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heightInches" className="text-xs text-gray-500">
                      Inches
                    </Label>
                    <Input
                      id="heightInches"
                      name="heightInches"
                      type="number"
                      min="0"
                      max="11"
                      defaultValue={defaultInches}
                      placeholder={heightPlaceholder.inches}
                      required
                      className="bg-white border-gray-300 text-gray-900 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.1"
                  defaultValue={defaultHeightCm}
                  placeholder={heightPlaceholder.cm}
                  required
                  className="bg-white border-gray-300 text-gray-900 rounded-lg"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Weight ({units.weight})</Label>
              {isUKWeight ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="weightStones" className="text-xs text-gray-500">
                      Stones
                    </Label>
                    <Input
                      id="weightStones"
                      name="weightStones"
                      type="number"
                      min="0"
                      max="50"
                      defaultValue={defaultStones}
                      placeholder={weightPlaceholder.stones}
                      required
                      className="bg-white border-gray-300 text-gray-900 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weightPounds" className="text-xs text-gray-500">
                      Pounds
                    </Label>
                    <Input
                      id="weightPounds"
                      name="weightPounds"
                      type="number"
                      min="0"
                      max="13"
                      defaultValue={defaultPounds}
                      placeholder={weightPlaceholder.pounds}
                      required
                      className="bg-white border-gray-300 text-gray-900 rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  defaultValue={defaultWeight}
                  placeholder={weightPlaceholder.single}
                  required
                  className="bg-white border-gray-300 text-gray-900 rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <div className="flex-1">
              <SubmitButton isEditing={isEditing} />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
