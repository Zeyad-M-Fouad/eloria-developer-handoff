"use client"

import { useTransition } from "react"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { StarRating } from "@/components/store/star-rating"
import { moderateReview } from "@/app/admin/actions"

type Item = {
  review: {
    id: number
    orderCode: string
    authorName: string
    rating: number
    body: string
    status: string
    createdAt: Date | string
  }
  productName: string
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function ReviewModerationList({ items, moderatable }: { items: Item[]; moderatable: boolean }) {
  const [pending, startTransition] = useTransition()

  function moderate(id: number, status: "published" | "rejected") {
    startTransition(async () => {
      const res = await moderateReview(id, status)
      if (res.ok) toast.success(status === "published" ? "Review published." : "Review rejected.")
      else toast.error("Failed.")
    })
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-5 py-16 text-center text-muted-foreground">
        Nothing here.
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {items.map(({ review, productName }) => (
        <li key={review.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <StarRating value={review.rating} />
                <span className="text-sm text-foreground">{productName}</span>
              </div>
              <p className="mt-2 text-pretty leading-relaxed text-foreground">{review.body || "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {review.authorName} · order {review.orderCode} · {formatDate(review.createdAt)}
              </p>
            </div>

            {moderatable && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => moderate(review.id, "published")}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  <Check width={15} height={15} />
                  Publish
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => moderate(review.id, "rejected")}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
                >
                  <X width={15} height={15} />
                  Reject
                </button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
