"use client"

import { useState, useTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, BarChart3, TableIcon } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import BMIEntryModal from "./bmi-entry-modal"
import EmptyState from "./empty-state"
import { deleteBMIEntry } from "@/lib/actions"
import { format } from "date-fns"
import {
  getUnitLabels,
  formatHeightForDisplay,
  formatWeightForDisplay,
  convertWeightFromMetric,
  type SystemOfMeasurement,
} from "@/lib/units"
import { formatAge } from "@/lib/age-utils"

interface BMIEntry {
  id: string
  created_at: string
  height: number
  weight: number
  bmi: number
}

interface User {
  system_of_measurement: SystemOfMeasurement
  height: number
  date_of_birth?: string
  sex: string
}

interface BMIDashboardProps {
  entries: BMIEntry[]
  user: User
}

export default function BMIDashboard({ entries, user }: BMIDashboardProps) {
  const [view, setView] = useState<"table" | "chart">("table")
  const [chartMetric, setChartMetric] = useState<"bmi" | "weight">("bmi")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<BMIEntry | undefined>()
  const [isPending, startTransition] = useTransition()

  const handleAddEntry = () => {
    setEditingEntry(undefined)
    setIsModalOpen(true)
  }

  const handleEditEntry = (entry: BMIEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      startTransition(async () => {
        try {
          await deleteBMIEntry(id)
        } catch (error) {
          console.error("Failed to delete entry:", error)
        }
      })
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-100 text-blue-800" }
    if (bmi < 25) return { label: "Normal", color: "bg-green-100 text-green-800" }
    if (bmi < 30) return { label: "Overweight", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Obese", color: "bg-red-100 text-red-800" }
  }

  const units = getUnitLabels(user.system_of_measurement)

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!entries || entries.length === 0) {
      return []
    }

    const processedData = entries
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((entry, index) => {
        const date = new Date(entry.created_at)
        const displayWeight = convertWeightFromMetric(entry.weight, user.system_of_measurement)

        // Convert weight to single number for chart
        let weightForChart: number
        if (typeof displayWeight === "number") {
          weightForChart = Math.round(displayWeight * 10) / 10
        } else {
          // For UK system, convert stones+pounds to just pounds for chart
          weightForChart = Math.round((displayWeight.stones * 14 + displayWeight.pounds) * 10) / 10
        }

        const dataPoint = {
          index: index + 1,
          date: format(date, "MMM d"),
          fullDate: format(date, "MMM d, yyyy"),
          bmi: Math.round(entry.bmi * 10) / 10,
          weight: weightForChart,
          originalWeight: entry.weight,
          weightDisplay:
            typeof displayWeight === "number"
              ? `${displayWeight.toFixed(1)} ${units.weight}`
              : `${displayWeight.stones}st ${displayWeight.pounds}lbs`,
        }

        return dataPoint
      })

    return processedData
  }, [entries, user.system_of_measurement, units.weight])

  if (entries.length === 0) {
    return (
      <>
        <EmptyState onAddEntry={handleAddEntry} />
        <BMIEntryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          entry={editingEntry}
          userHeight={user.height}
          systemOfMeasurement={user.system_of_measurement}
        />
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Height:</span>
              <p className="font-medium">{formatHeightForDisplay(user.height, user.system_of_measurement)}</p>
            </div>
            <div>
              <span className="text-gray-500">Age:</span>
              <p className="font-medium">{formatAge(user.date_of_birth)}</p>
            </div>
            <div>
              <span className="text-gray-500">Sex:</span>
              <p className="font-medium capitalize">{user.sex}</p>
            </div>
            <div>
              <span className="text-gray-500">System:</span>
              <p className="font-medium">{user.system_of_measurement.toUpperCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-2">
          <Button variant={view === "table" ? "default" : "outline"} size="sm" onClick={() => setView("table")}>
            <TableIcon className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button variant={view === "chart" ? "default" : "outline"} size="sm" onClick={() => setView("chart")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Chart
          </Button>

          {view === "chart" && (
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant={chartMetric === "bmi" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartMetric("bmi")}
              >
                BMI
              </Button>
              <Button
                variant={chartMetric === "weight" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartMetric("weight")}
              >
                Weight
              </Button>
            </div>
          )}
        </div>

        <Button onClick={handleAddEntry} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Content */}
      {view === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>BMI Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>BMI</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const category = getBMICategory(entry.bmi)
                    const displayHeight = formatHeightForDisplay(entry.height, user.system_of_measurement)
                    const displayWeight = formatWeightForDisplay(entry.weight, user.system_of_measurement)

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {format(new Date(entry.created_at), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{displayHeight}</TableCell>
                        <TableCell>{displayWeight}</TableCell>
                        <TableCell className="font-semibold">{entry.bmi}</TableCell>
                        <TableCell>
                          <Badge className={category.color}>{category.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditEntry(entry)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{chartMetric === "bmi" ? "BMI" : "Weight"} Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length < 2 ? (
              <div className="h-64 flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Add more entries to see your trend chart</p>
                  {chartData.length === 1 && (
                    <p className="text-xs mt-2">
                      Current: {chartMetric === "bmi" ? `${chartData[0].bmi} BMI` : chartData[0].weightDisplay}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <LineChart
                  width={800}
                  height={400}
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: any) => {
                      if (chartMetric === "weight") {
                        const dataPoint = chartData.find((d) => d[chartMetric] === value)
                        return [dataPoint?.weightDisplay || value, `Weight (${units.weight})`]
                      }
                      return [value, "BMI"]
                    }}
                    labelFormatter={(label: string) => {
                      const dataPoint = chartData.find((d) => d.date === label)
                      return dataPoint?.fullDate || label
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={chartMetric}
                    stroke={chartMetric === "bmi" ? "#22c55e" : "#3b82f6"}
                    strokeWidth={3}
                    dot={{
                      fill: chartMetric === "bmi" ? "#22c55e" : "#3b82f6",
                      strokeWidth: 2,
                      r: 6,
                    }}
                    activeDot={{
                      r: 8,
                      stroke: chartMetric === "bmi" ? "#22c55e" : "#3b82f6",
                      strokeWidth: 2,
                      fill: "white",
                    }}
                  />
                </LineChart>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <BMIEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entry={editingEntry}
        userHeight={user.height}
        systemOfMeasurement={user.system_of_measurement}
      />
    </div>
  )
}
