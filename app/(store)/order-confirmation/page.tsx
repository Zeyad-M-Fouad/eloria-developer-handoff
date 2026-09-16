import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Check, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Order received",
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  if (!code) redirect("/products")

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center md:px-6">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check width={30} height={30} />
      </span>
      <h1 className="mt-6 text-balance font-serif text-3xl text-foreground">Your order request is in</h1>
      <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
        Thank you. Keep your order code safe — you&apos;ll need it to ask about your order or to leave a review later.
      </p>

      <div className="mx-auto mt-8 w-fit rounded-xl border border-border bg-card px-8 py-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Order code</p>
        <p className="mt-1 font-mono text-2xl tracking-wider text-foreground">{code}</p>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-lg bg-secondary/50 p-5 text-left text-sm leading-relaxed text-muted-foreground">
        <MessageCircle width={18} height={18} className="mt-0.5 shrink-0 text-primary" />
        <p>
          We&apos;ll message you on WhatsApp shortly to confirm availability, agree the final total including delivery,
          and arrange a small deposit. No payment was taken online.
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button render={<Link href="/products" />} className="rounded-full">
          Continue shopping
        </Button>
      </div>
    </div>
  )
}
