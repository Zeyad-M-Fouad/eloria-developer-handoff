import { StarRating } from "@/components/store/star-rating"
import { ReviewForm } from "@/components/store/review-form"
import type { PublishedReviews } from "@/lib/store/queries"

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export function ReviewsSection({
  productId,
  reviews,
}: {
  productId: number
  reviews: PublishedReviews
}) {
  return (
    <section className="mt-20 border-t border-border/70 pt-12">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Reviews</h2>
          {reviews.count > 0 ? (
            <div className="mt-3 flex items-center gap-3">
              <StarRating value={reviews.average} size={20} />
              <span className="text-sm text-muted-foreground">
                {reviews.average.toFixed(1)} · {reviews.count} review{reviews.count > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No reviews yet — be the first to share yours.</p>
          )}

          <div className="mt-6 space-y-6">
            {reviews.items.map((r) => (
              <article key={r.id} className="border-b border-border/60 pb-6 last:border-0">
                <StarRating value={r.rating} />
                <p className="mt-2 text-pretty leading-relaxed text-foreground">{r.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.authorName} · {formatDate(r.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-serif text-xl text-foreground">Write a review</h3>
          <ReviewForm productId={productId} />
        </div>
      </div>
    </section>
  )
}
