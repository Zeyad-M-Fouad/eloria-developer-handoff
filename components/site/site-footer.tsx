import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <p className="font-serif text-2xl font-semibold text-foreground">Eloria</p>
          <p className="mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
            Considered skincare in small batches. Every order is confirmed personally over WhatsApp — no rushed
            checkouts, just care.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-foreground">
                Shop all
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-foreground">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-foreground">
                Shipping
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Care</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/write-a-review" className="hover:text-foreground">
                Write a review
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Eloria. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Orders confirmed by WhatsApp · Deposit handled personally</p>
            <Link href="/admin" className="text-muted-foreground/70 hover:text-foreground">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
