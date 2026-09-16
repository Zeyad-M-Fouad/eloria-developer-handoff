import Link from "next/link"
import { getReviewsByStatus } from "@/lib/admin/queries"
import { ReviewModerationList } from "@/components/admin/review-moderation-list"
import { cn } from "@/lib/utils"

export const metadata = { title: "Reviews" }

const TABS = [
  { key: "pending", label: "Pending" },
  { key: "published", label: "Published" },
  { key: "rejected", label: "Rejected" },
] as const

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = (TABS.find((t) => t.key === status)?.key ?? "pending") as "pending" | "published" | "rejected"
  const items = await getReviewsByStatus(active)

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews are verified by order code and appear in the store once published.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/reviews?status=${t.key}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              active === t.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <ReviewModerationList items={items} moderatable={active === "pending"} />
    </div>
  )
}
