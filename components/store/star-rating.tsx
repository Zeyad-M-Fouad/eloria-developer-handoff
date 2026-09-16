import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  value,
  size = 16,
  className,
}: {
  value: number
  size?: number
  className?: string
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i - 0.25
        return (
          <Star
            key={i}
            width={size}
            height={size}
            className={filled ? "fill-accent text-accent" : "fill-transparent text-border"}
          />
        )
      })}
    </div>
  )
}
