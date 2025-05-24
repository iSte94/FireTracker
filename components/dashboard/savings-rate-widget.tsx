"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const monthlyData = [
  { month: "Gen", rate: 38 },
  { month: "Feb", rate: 40 },
  { month: "Mar", rate: 37 },
  { month: "Apr", rate: 41 },
  { month: "Mag", rate: 39 },
  { month: "Giu", rate: 42 },
  { month: "Lug", rate: 44 },
  { month: "Ago", rate: 43 },
  { month: "Set", rate: 45 },
  { month: "Ott", rate: 42 },
  { month: "Nov", rate: 41 },
  { month: "Dic", rate: 42 },
]

export function SavingsRateWidget() {
  const currentRate = 42
  const targetRate = 50
  const averageRate = 41
  const lastMonthRate = 41
  const trend = currentRate > lastMonthRate ? "up" : "down"
  const trendValue = Math.abs(currentRate - lastMonthRate)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Tasso di Risparmio
        </CardTitle>
        <CardDescription>
          Il tuo tasso di risparmio attuale e storico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-bold">{currentRate}%</p>
              <p className="text-sm text-muted-foreground">Tasso attuale</p>
            </div>
            <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
              {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{trend === "up" ? "+" : "-"}{trendValue}%</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Obiettivo</span>
              <span className="font-medium">{targetRate}%</span>
            </div>
            <Progress value={(currentRate / targetRate) * 100} className="h-2" />
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis 
                dataKey="month" 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Mese
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.month}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Tasso
                            </span>
                            <span className="font-bold">
                              {payload[0].value}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t">
          <div className="text-center">
            <p className="text-sm font-medium">{averageRate}%</p>
            <p className="text-xs text-muted-foreground">Media annuale</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">€3,500</p>
            <p className="text-xs text-muted-foreground">Risparmio mensile</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">€42,000</p>
            <p className="text-xs text-muted-foreground">Risparmio annuale</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}