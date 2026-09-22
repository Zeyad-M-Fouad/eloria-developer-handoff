"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tags,
  Boxes,
  Star,
  RotateCcw,
  BarChart3,
  ClipboardList,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/activity", label: "Activity log", icon: ClipboardList },
]

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await authClient.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar md:h-svh md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="font-serif text-xl font-semibold text-sidebar-foreground">
          Eloria
        </Link>
        <span className="rounded-full bg-sidebar-primary/10 px-2 py-0.5 text-xs text-sidebar-primary">Admin</span>
      </div>

      <nav className="flex flex-1 flex-row gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <link.icon width={18} height={18} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="hidden border-t border-sidebar-border p-3 md:block">
        <p className="truncate px-3 py-1 text-xs text-sidebar-foreground/60">{email}</p>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut width={18} height={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
