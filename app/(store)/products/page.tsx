import type { Metadata } from "next"
import { Catalog } from "@/components/store/catalog"
import { getActiveProducts, getCategories } from "@/lib/store/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Shop all",
  description: "Browse Eloria's small-batch botanical skincare — body lotion, hand cream, cleanser, and body oil.",
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getActiveProducts(), getCategories()])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-foreground">Shop all</h1>
        <p className="mt-2 max-w-lg text-pretty text-muted-foreground">
          Everything we make, in one place. Choose a size and scent on each product, then reserve by WhatsApp.
        </p>
      </header>

      <Catalog products={products} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
