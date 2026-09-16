import type { Metadata } from "next"
import { MessageCircle, Mail, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Eloria. We confirm every order personally over WhatsApp.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="font-serif text-4xl text-foreground">Contact us</h1>
      <p className="mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
        Every Eloria order is handled personally. Reach us with your order code and we&apos;ll help with availability,
        delivery, or anything else.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle width={20} height={20} />
          </span>
          <h2 className="mt-4 font-serif text-lg text-foreground">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The fastest way to reach us for orders, deposits, and delivery. We confirm all orders here.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail width={20} height={20} />
          </span>
          <h2 className="mt-4 font-serif text-lg text-foreground">Email</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Prefer email? Send us your order code and question and we&apos;ll get back to you.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-6">
        <Clock width={20} height={20} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <h2 className="font-serif text-lg text-foreground">Hours</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            We reply to messages daily. Orders placed overnight are confirmed the next morning.
          </p>
        </div>
      </div>
    </div>
  )
}
