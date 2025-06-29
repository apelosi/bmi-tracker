"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Image from "next/image"

interface EmptyStateProps {
  onAddEntry: () => void
}

export default function EmptyState({ onAddEntry }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <Image
          src="/images/penguin-empty-state.png"
          alt="Friendly penguin encouraging you to start tracking"
          width={200}
          height={200}
          className="mx-auto mb-6"
        />
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Ready to start your health journey?</h3>
        <p className="text-gray-600 mb-8">
          🐧 Our friendly penguin is excited to help you track your BMI! Add your first entry to get started.
        </p>
        <Button
          onClick={onAddEntry}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium rounded-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Your First Entry
        </Button>
      </div>
    </div>
  )
}
