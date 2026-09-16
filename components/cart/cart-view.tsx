"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/money"
import { useCart } from "@/components/cart/cart-provider"

function optionLabel(size: string | null, color: string | null, scent: string | null) {
  return [size, color, scent].filter(Boolean).join(" / ")
}

export function CartView() {
  const { items, updateQuantity, removeItem, subtotalCents, discountCents, hydrated } = useCart()

  if (!hydrated) {
    return <div className="py-20 text-center text-muted-foreground">Loading your bag…</div>
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag width={26} height={26} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-serif text-xl text-foreground">Your bag is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Discover our small-batch skincare.</p>
        </div>
        <Button render={<Link href="/products" />} className="rounded-full">
          Shop all products
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <ul className="divide-y divide-border/70">
        {items.map((item) => {
          const opts = optionLabel(item.size, item.color, item.scent)
          return (
            <li key={item.combinationId} className="flex gap-4 py-5">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-secondary/50">
                {item.image && (
                  <Image src={item.image || "/placeholder.svg"} alt={item.productName} fill className="object-cover" sizes="80px" />
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-serif text-lg text-foreground hover:underline">
                      {item.productName}
                    </Link>
                    {opts && <p className="text-sm text-muted-foreground">{opts}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">{formatMoney(item.unitPriceCents)}</p>
                    {item.listPriceCents > item.unitPriceCents && (
                      <p className="text-xs text-muted-foreground line-through">{formatMoney(item.listPriceCents)}</p>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.combinationId, item.quantity - 1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground"
                      aria-label="Decrease quantity"
                    >
                      <Minus width={14} height={14} />
                    </button>
                    <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.combinationId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQty}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus width={14} height={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.combinationId)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 width={15} height={15} />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-xl text-foreground">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="text-foreground">{formatMoney(subtotalCents)}</dd>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">You save</dt>
              <dd className="text-accent">−{formatMoney(discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd className="text-muted-foreground">Confirmed on WhatsApp</dd>
          </div>
        </dl>

        <div className="mt-4 flex justify-between border-t border-border/70 pt-4">
          <span className="text-foreground">Estimated total</span>
          <span className="text-lg text-foreground">{formatMoney(subtotalCents)}</span>
        </div>

        <Button render={<Link href="/checkout" />} size="lg" className="mt-6 w-full rounded-full">
          Continue to details
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          No payment online. We confirm your order and a small deposit by WhatsApp.
        </p>
      </div>
    </div>
  )
}
