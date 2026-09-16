import type { Metadata } from "next"
import { CartView } from "@/components/cart/cart-view"

export const metadata: Metadata = {
  title: "Your bag",
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="mb-8 font-serif text-4xl text-foreground">Your bag</h1>
      <CartView />
    </div>
  )
}
