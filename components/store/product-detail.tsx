"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Minus, Plus, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { formatMoney, isOnSale, discountPercent } from "@/lib/money"
import { useCart } from "@/components/cart/cart-provider"
import type { StoreProduct, Combination } from "@/lib/store/queries"

type Dim = "size" | "color" | "scent"
const DIMS: { key: Dim; label: string }[] = [
  { key: "size", label: "Size" },
  { key: "color", label: "Colour" },
  { key: "scent", label: "Scent" },
]

function uniqueOptions(combos: Combination[], dim: Dim): string[] {
  const seen: string[] = []
  for (const c of combos) {
    const v = c[dim]
    if (v && !seen.includes(v)) seen.push(v)
  }
  return seen
}

export function ProductDetail({ product }: { product: StoreProduct }) {
  const { addItem } = useCart()

  const optionMap = useMemo(() => {
    const map: Record<Dim, string[]> = { size: [], color: [], scent: [] }
    for (const d of DIMS) map[d.key] = uniqueOptions(product.combinations, d.key)
    return map
  }, [product.combinations])

  // Prefer an in-stock combination as the initial selection.
  const initialCombo =
    product.combinations.find((c) => c.availableQty > 0) ?? product.combinations[0] ?? null

  const [selection, setSelection] = useState<Record<Dim, string | null>>({
    size: initialCombo?.size ?? null,
    color: initialCombo?.color ?? null,
    scent: initialCombo?.scent ?? null,
  })
  const [qty, setQty] = useState(1)

  const selected: Combination | null = useMemo(() => {
    return (
      product.combinations.find((c) =>
        DIMS.every((d) => {
          if (optionMap[d.key].length === 0) return true
          return c[d.key] === selection[d.key]
        }),
      ) ?? null
    )
  }, [product.combinations, selection, optionMap])

  const price = selected
  const onSale = price ? isOnSale(price.priceCents, price.salePriceCents) : false
  const effective = price ? (onSale ? (price.salePriceCents as number) : price.priceCents) : product.minPriceCents
  const stock = selected?.availableQty ?? 0
  const canAdd = !!selected && stock > 0
  const lowStock = canAdd && stock <= (selected?.lowStockThreshold ?? 5)

  function choose(dim: Dim, value: string) {
    setSelection((prev) => ({ ...prev, [dim]: value }))
    setQty(1)
  }

  function isOptionAvailable(dim: Dim, value: string): boolean {
    // Would a combination exist (and be in stock) if we picked this value,
    // holding the other selected dimensions where possible?
    return product.combinations.some(
      (c) =>
        c[dim] === value &&
        c.availableQty > 0 &&
        DIMS.every((d) => d.key === dim || optionMap[d.key].length === 0 || c[d.key] === selection[d.key]),
    )
  }

  function handleAdd() {
    if (!selected) {
      toast.error("Please choose an available option.")
      return
    }
    if (stock <= 0) {
      toast.error("That option is sold out.")
      return
    }
    addItem(
      {
        combinationId: selected.id,
        productId: product.id,
        slug: product.slug,
        productName: product.name,
        itemCode: product.itemCode,
        image: product.images[0] ?? null,
        size: selected.size,
        color: selected.color,
        scent: selected.scent,
        unitPriceCents: effective,
        listPriceCents: selected.priceCents,
        maxQty: stock,
      },
      qty,
    )
    toast.success(`Added ${product.name} to your bag.`)
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary/50">
        {product.images[0] && (
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          {onSale && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">
              Save {discountPercent(price!.priceCents, price!.salePriceCents)}%
            </Badge>
          )}
        </div>
      </div>

      <div>
        {product.categoryName && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
        )}
        <h1 className="mt-1 text-balance font-serif text-3xl leading-tight text-foreground md:text-4xl">
          {product.name}
        </h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl text-foreground">{formatMoney(effective)}</span>
          {onSale && price && (
            <span className="text-base text-muted-foreground line-through">{formatMoney(price.priceCents)}</span>
          )}
        </div>

        <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">{product.description}</p>

        <div className="mt-7 space-y-6">
          {DIMS.map((d) =>
            optionMap[d.key].length > 0 ? (
              <div key={d.key}>
                <p className="mb-2 text-sm font-medium text-foreground">{d.label}</p>
                <div className="flex flex-wrap gap-2">
                  {optionMap[d.key].map((value) => {
                    const active = selection[d.key] === value
                    const available = isOptionAvailable(d.key, value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => choose(d.key, value)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-foreground/40",
                          !available && !active && "text-muted-foreground",
                        )}
                      >
                        {value}
                        {!available && !active && <span className="ml-1 text-xs">· sold out</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null,
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus width={16} height={16} />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
                disabled={!canAdd || qty >= stock}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-foreground disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus width={16} height={16} />
              </button>
            </div>

            <Button size="lg" className="flex-1 rounded-full" onClick={handleAdd} disabled={!canAdd}>
              {canAdd ? "Add to bag" : "Sold out"}
            </Button>
          </div>

          {lowStock && (
            <p className="text-sm text-accent">Only {stock} left — reserve soon.</p>
          )}
          {!selected && (
            <p className="text-sm text-muted-foreground">This combination isn&apos;t available. Try another option.</p>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-4 text-sm text-muted-foreground">
            <Check width={16} height={16} className="mt-0.5 shrink-0 text-primary" />
            <p>
              Add items to your bag, then confirm by WhatsApp. We&apos;ll agree the final total and a small deposit —
              no card details are taken online.
            </p>
          </div>

          <Accordion className="border-t border-border/70">
            <AccordionItem value="ingredients">
              <AccordionTrigger>Ingredients</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {product.ingredients || "Ingredient list coming soon."}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-to-use">
              <AccordionTrigger>How to use</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {product.usageInstructions || "Usage guidance coming soon."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
