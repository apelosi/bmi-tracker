"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { completeOnboarding } from "@/lib/actions"
import { getUnitLabels, getHeightPlaceholder, getWeightPlaceholder, type SystemOfMeasurement } from "@/lib/units"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-base font-medium rounded-lg h-12"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Setting up your profile...
        </>
      ) : (
        "Complete Setup"
      )}
    </Button>
  )
}

export default function OnboardingForm() {
  const [state, formAction] = useActionState(completeOnboarding, null)
  const [selectedSystem, setSelectedSystem] = useState<SystemOfMeasurement>("metric")

  const units = getUnitLabels(selectedSystem)
  const heightPlaceholder = getHeightPlaceholder(selectedSystem)
  const weightPlaceholder = getWeightPlaceholder(selectedSystem)

  const isImperialHeight = selectedSystem === "us" || selectedSystem === "uk"
  const isUKWeight = selectedSystem === "uk"

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Welcome to BMI Tracker!</h1>
            <p className="text-gray-600">Let's set up your profile to get started</p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg"
                />
              </div>

              <div>
                <Label className="text-base font-medium text-gray-900 mb-4 block">
                  System of Measurement <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  name="system"
                  defaultValue="metric"
                  onValueChange={(value) => setSelectedSystem(value as SystemOfMeasurement)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric" className="font-medium">
                      Metric (kg/cm)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="us" id="us" />
                    <Label htmlFor="us" className="font-medium">
                      US (lbs/ft)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value="uk" id="uk" />
                    <Label htmlFor="uk" className="font-medium">
                      UK (st/ft)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Height <span className="text-red-500">*</span>
                  </Label>
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
                      placeholder={heightPlaceholder.cm}
                      required
                      className="bg-white border-gray-300 text-gray-900 rounded-lg"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth (optional)
                  </Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-white border-gray-300 text-gray-900 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex" className="text-sm font-medium text-gray-700">
                  Sex (optional)
                </Label>
                <Select name="sex">
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 rounded-lg">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="not specified">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sample Weight Input for Reference */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Sample Weight ({units.weight}) - for reference
                </Label>
                {isUKWeight ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="sampleWeightStones" className="text-xs text-gray-500">
                        Stones
                      </Label>
                      <Input
                        id="sampleWeightStones"
                        name="sampleWeightStones"
                        type="number"
                        min="0"
                        max="50"
                        placeholder={weightPlaceholder.stones}
                        disabled
                        className="bg-gray-100 border-gray-300 text-gray-500 rounded-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sampleWeightPounds" className="text-xs text-gray-500">
                        Pounds
                      </Label>
                      <Input
                        id="sampleWeightPounds"
                        name="sampleWeightPounds"
                        type="number"
                        min="0"
                        max="13"
                        placeholder={weightPlaceholder.pounds}
                        disabled
                        className="bg-gray-100 border-gray-300 text-gray-500 rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <Input
                    id="sampleWeight"
                    name="sampleWeight"
                    type="number"
                    step="0.1"
                    placeholder={weightPlaceholder.single}
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-500 rounded-lg"
                  />
                )}
                <p className="text-xs text-gray-500">
                  This is just to show you how weight will be entered later. You'll add your actual weight when creating
                  BMI entries.
                </p>
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  )
}
