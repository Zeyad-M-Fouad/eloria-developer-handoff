import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ProductDetail } from "@/components/store/product-detail"
import { ReviewsSection } from "@/components/store/reviews-section"
import { getProductBySlug, getPublishedReviews } from "@/lib/store/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product not found" }
  return {
    title: product.name,
    description: product.description.slice(0, 155),
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const reviews = await getPublishedReviews(product.id)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <Link
        href="/products"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft width={16} height={16} />
        Back to shop
      </Link>

      <ProductDetail product={product} />
      <div id="reviews">
        <ReviewsSection productId={product.id} reviews={reviews} />
      </div>
    </div>
  )
}
