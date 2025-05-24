import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChartSkeletonProps {
  className?: string
  height?: string
}

export function ChartSkeleton({ className, height = "h-80" }: ChartSkeletonProps) {
  // Altezze predeterminate per evitare hydration mismatch
  const barHeights = [45, 65, 30, 75, 50, 40, 80, 35, 60, 25, 70, 55]
  
  return (
    <div className={cn("w-full", height, className)}>
      <div className="flex h-full items-center justify-center">
        <div className="w-full h-full p-4">
          {/* Asse Y */}
          <div className="flex h-full">
            <div className="flex flex-col justify-between pr-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-8" />
              ))}
            </div>
            
            {/* Area grafico */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
                {barHeights.map((height, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                ))}
              </div>
              
              {/* Asse X */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-12" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <Skeleton className="h-5 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <div className="pt-4">
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}