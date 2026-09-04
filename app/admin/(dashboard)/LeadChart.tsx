'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface LeadChartProps {
  /** Leads grouped by date for the last 7 days: { date: string, count: number }[] */
  dailyLeads: { date: string; count: number }[]
  totalLeads: number
  thisWeekCount: number
  lastWeekCount: number
}

export function LeadChart({ dailyLeads, totalLeads, thisWeekCount, lastWeekCount }: LeadChartProps) {
  const maxCount = Math.max(...dailyLeads.map((d) => d.count), 1)

  // Growth indicator
  const growth = lastWeekCount > 0
    ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
    : thisWeekCount > 0
      ? 100
      : 0

  const GrowthIcon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus
  const growthColor = growth > 0 ? 'text-emerald-500' : growth < 0 ? 'text-red-500' : 'text-muted-foreground'

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{totalLeads}</div>
          <div className="text-xs text-muted-foreground">Total Leads</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{thisWeekCount}</div>
          <div className="text-xs text-muted-foreground">Minggu Ini</div>
        </div>
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1 text-lg font-bold ${growthColor}`}>
            <GrowthIcon className="h-4 w-4" />
            <span>{growth > 0 ? '+' : ''}{growth}%</span>
          </div>
          <div className="text-xs text-muted-foreground">vs Minggu Lalu</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Leads per Hari (7 Hari Terakhir)
        </div>
        <div className="flex items-end gap-2 h-32">
          {dailyLeads.map((day) => {
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-foreground">
                  {day.count > 0 ? day.count : ''}
                </span>
                <div className="w-full relative flex-1 flex items-end">
                  {/* A zero-lead day must not draw a bar: a 2px sliver reads as data */}
                  {day.count > 0 ? (
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all duration-300 min-h-[2px]"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  ) : (
                    <div className="w-full h-px bg-border" />
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatShortDate(day.date)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatShortDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr.slice(5)
  }
}
