"use client"

import { useMemo, useState } from "react"
import { ProductCard } from "@/components/store/product-card"
import { cn } from "@/lib/utils"
import type { StoreProduct } from "@/lib/store/queries"

type SortKey = "featured" | "price-asc" | "price-desc"

export function Catalog({
  products,
  categories,
}: {
  products: StoreProduct[]
  categories: { id: number; name: string }[]
}) {
  const [activeCategory, setActiveCategory] = useState<number | "all">("all")
  const [onlySale, setOnlySale] = useState(false)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>("featured")

  const visible = useMemo(() => {
    let list = products.slice()
    if (activeCategory !== "all") list = list.filter((p) => p.categoryId === activeCategory)
    if (onlySale) list = list.filter((p) => p.hasSale && !p.soldOut)
    if (inStockOnly) list = list.filter((p) => !p.soldOut)
    if (sort === "price-asc") list.sort((a, b) => a.minPriceCents - b.minPriceCents)
    if (sort === "price-desc") list.sort((a, b) => b.minPriceCents - a.minPriceCents)
    return list
  }, [products, activeCategory, onlySale, inStockOnly, sort])

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border/70 pb-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={activeCategory === c.id} onClick={() => setActiveCategory(c.id)}>
              {c.name}
            </FilterChip>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-border md:block" />
          <FilterChip active={onlySale} onClick={() => setOnlySale((v) => !v)}>
            On sale
          </FilterChip>
          <FilterChip active={inStockOnly} onClick={() => setInStockOnly((v) => !v)}>
            In stock
          </FilterChip>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-input bg-card px-3 py-1.5 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">No products match these filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
