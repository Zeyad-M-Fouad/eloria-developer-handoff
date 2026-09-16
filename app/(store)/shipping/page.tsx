import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shipping & delivery",
  description: "How Eloria delivery works — confirmed personally, with a small deposit to secure your order.",
}

const STEPS = [
  {
    title: "Place your request",
    body: "Add items to your bag and submit your details. You'll receive an order code straight away.",
  },
  {
    title: "We confirm on WhatsApp",
    body: "We check availability and agree the final total, including a delivery fee based on your address.",
  },
  {
    title: "A small deposit",
    body: "A light deposit secures your batch. The balance is settled on delivery.",
  },
  {
    title: "On its way",
    body: "Once your order is prepared and sent, we'll share tracking or delivery timing over WhatsApp.",
  },
]

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="font-serif text-4xl text-foreground">Shipping &amp; delivery</h1>
      <p className="mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
        We keep delivery personal. Rather than a fixed checkout, we confirm each order and its delivery cost with you
        directly — so you always know the total before anything is paid.
      </p>

      <ol className="mt-10 space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-xl border border-border bg-card p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {i + 1}
            </span>
            <div>
              <h2 className="font-serif text-lg text-foreground">{step.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-6 text-sm leading-relaxed text-muted-foreground">
        Delivery fees vary by location and are agreed before your deposit. No card details are ever taken on this
        site.
      </div>
    </div>
  )
}
