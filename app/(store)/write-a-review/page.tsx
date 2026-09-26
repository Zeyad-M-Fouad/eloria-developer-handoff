import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { getActiveProducts } from "@/backend/store"

export const metadata: Metadata = {
  title: "Write a review",
  description: "Share your experience with an Eloria product. You'll need the order code from your purchase.",
}
export const dynamic = "force-dynamic"

export default async function WriteAReviewPage() {
  const products = await getActiveProducts()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="font-serif text-4xl text-foreground">Write a review</h1>
      <p className="mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
        Choose the product you&apos;d like to review. You&apos;ll need the order code from a purchase that includes it —
        reviews are published after a quick moderation check.
      </p>

      <ul className="mt-10 divide-y divide-border/70 overflow-hidden rounded-xl border border-border bg-card">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={`/products/${p.slug}#reviews`}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-secondary/50">
                {p.images[0] && (
                  <Image src={p.images[0] || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="48px" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-serif text-lg text-foreground">{p.name}</p>
                {p.categoryName && <p className="text-xs text-muted-foreground">{p.categoryName}</p>}
              </div>
              <ChevronRight width={18} height={18} className="text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
