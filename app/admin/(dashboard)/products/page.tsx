import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"
import { getAdminProducts } from "@/lib/admin/queries"
import { formatMoney, isOnSale } from "@/lib/money"
import { cn } from "@/lib/utils"

export const metadata = { title: "Products" }

export default async function AdminProductsPage() {
  const products = await getAdminProducts()

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus width={16} height={16} />
          New product
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-5 py-16 text-center text-muted-foreground">
          No products yet. Create your first one.
        </p>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => {
            const totalStock = p.combinations.reduce((s, c) => s + c.availableQty, 0)
            const hasSale = p.combinations.some((c) => isOnSale(c.priceCents, c.salePriceCents))
            const prices = p.combinations.map((c) => c.priceCents)
            const priceLabel = prices.length
              ? prices.every((x) => x === prices[0])
                ? formatMoney(prices[0])
                : `${formatMoney(Math.min(...prices))} – ${formatMoney(Math.max(...prices))}`
              : "—"
            return (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-secondary/50">
                  {p.images?.[0] && (
                    <Image src={p.images[0] || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-serif text-lg text-foreground">{p.name}</p>
                    {hasSale && <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">Sale</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.itemCode} · {p.categoryName ?? "Uncategorised"} · {p.combinations.length} variant
                    {p.combinations.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm text-foreground">{priceLabel}</p>
                  <p className="text-xs text-muted-foreground">{totalStock} in stock</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs",
                    p.isActive ? "bg-primary/12 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {p.isActive ? "Active" : "Hidden"}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
