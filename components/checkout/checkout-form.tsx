"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatMoney } from "@/lib/money"
import { useCart } from "@/components/cart/cart-provider"
import { submitOrder } from "@/app/actions/orders"

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotalCents, discountCents, clear, hydrated } = useCart()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [pending, startTransition] = useTransition()

  if (hydrated && items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-xl text-foreground">Your bag is empty</p>
        <Button render={<Link href="/products" />} className="mt-5 rounded-full">
          Shop all products
        </Button>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await submitOrder({
        items: items.map((i) => ({ combinationId: i.combinationId, quantity: i.quantity })),
        email,
        phone,
        address,
      })
      if (res.ok) {
        clear()
        router.push(`/order-confirmation?code=${encodeURIComponent(res.orderCode)}`)
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-xl text-foreground">Your details</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll use these to confirm your order and arrange delivery over WhatsApp.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">WhatsApp phone number</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+20 1X XXX XXXX"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Delivery address</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={4}
            placeholder="Street, building, city, and any landmarks"
            required
          />
        </div>

        <div className="rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed text-muted-foreground">
          After you place your request, you&apos;ll receive an order code. We&apos;ll reach out on WhatsApp to confirm
          availability, agree the final total including delivery, and arrange a small deposit. No card details are
          taken here.
        </div>
      </div>

      <div className="h-fit rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-xl text-foreground">Your order</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {items.map((i) => {
            const opts = [i.size, i.color, i.scent].filter(Boolean).join(" / ")
            return (
              <li key={i.combinationId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {i.productName}
                  {opts ? ` · ${opts}` : ""} × {i.quantity}
                </span>
                <span className="shrink-0 text-foreground">{formatMoney(i.unitPriceCents * i.quantity)}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 space-y-2 border-t border-border/70 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatMoney(subtotalCents)}</span>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">You save</span>
              <span className="text-accent">−{formatMoney(discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">Confirmed on WhatsApp</span>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={pending || !hydrated} className="mt-6 w-full rounded-full">
          {pending ? "Placing request…" : "Place order request"}
        </Button>
      </div>
    </form>
  )
}
