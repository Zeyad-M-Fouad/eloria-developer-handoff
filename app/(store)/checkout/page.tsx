import type { Metadata } from "next"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export const metadata: Metadata = {
  title: "Checkout",
}

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="mb-8 font-serif text-4xl text-foreground">Checkout</h1>
      <CheckoutForm />
    </div>
  )
}
