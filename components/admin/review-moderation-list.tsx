"use client"

import { useTransition } from "react"
import { Check, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { StarRating } from "@/components/store/star-rating"
import { Switch } from "@/components/ui/switch"
import { deleteReview, moderateReview, setReviewFeaturedOnHome } from "@/app/admin/actions"

type Item = {
  review: {
    id: number
    orderCode: string
    authorName: string
    rating: number
    body: string
    status: string
    featuredOnHome: boolean
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

  function toggleFeatured(id: number, featured: boolean) {
    startTransition(async () => {
      const res = await setReviewFeaturedOnHome(id, featured)
      if (res.ok) toast.success(featured ? "Now showing on the homepage." : "Hidden from the homepage.")
      else toast.error("Failed.")
    })
  }

  function removeReview(id: number) {
    if (!window.confirm("Delete this review permanently? This cannot be undone.")) return
    startTransition(async () => {
      const res = await deleteReview(id)
      if (res.ok) toast.success("Review deleted.")
      else toast.error("Could not delete review.")
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

            <div className="flex flex-col items-end gap-3">
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

              {review.status === "published" && (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Show on homepage
                  <Switch
                    checked={review.featuredOnHome}
                    disabled={pending}
                    onCheckedChange={(checked) => toggleFeatured(review.id, checked)}
                  />
                </label>
              )}

              <button
                type="button"
                disabled={pending}
                onClick={() => removeReview(review.id)}
                aria-label={`Delete review by ${review.authorName}`}
                className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
              >
                <Trash2 width={15} height={15} />
                Delete
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
