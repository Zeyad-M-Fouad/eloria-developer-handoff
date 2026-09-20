"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ShoppingBag, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/cart/cart-provider"

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/#faq", label: "FAQ" },
  { href: "/shipping", label: "Shipping" },
  { href: "/contact", label: "Contact" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { count, hydrated } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight text-foreground">
            Eloria
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  item.href === "/#faq" ? pathname === "/" : pathname === item.href ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            aria-label={`Bag${hydrated && count ? `, ${count} items` : ""}`}
          >
            <ShoppingBag width={20} height={20} />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X width={20} height={20} /> : <Menu width={20} height={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/70 bg-background px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 text-sm text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
