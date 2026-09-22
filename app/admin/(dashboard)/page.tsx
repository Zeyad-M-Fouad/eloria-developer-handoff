import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { getOverviewStats, getRecentNotifications, getLowStockCombinations } from "@/lib/admin/queries"
import { NotificationFeed } from "@/components/admin/notification-feed"
import { formatMoney } from "@/lib/money"

export const metadata = { title: "Admin overview" }
export const dynamic = "force-dynamic"

export default async function AdminOverviewPage() {
  const [stats, notifications, lowStock] = await Promise.all([
    getOverviewStats(),
    getRecentNotifications(),
    getLowStockCombinations(),
  ])

  const cards = [
    { label: "Pending orders", value: String(stats.pendingOrders), href: "/admin/orders?state=pending" },
    { label: "Delivered revenue", value: formatMoney(stats.deliveredRevenueCents), href: "/admin/reports" },
    { label: "Gross collections (all orders)", value: formatMoney(stats.grossCollectionsCents), href: "/admin/orders" },
    { label: "Refunds (all orders)", value: formatMoney(stats.refundsCents), href: "/admin/orders" },
    { label: "Net collections (all orders)", value: formatMoney(stats.netCollectionsCents), href: "/admin/orders" },
    { label: "Low stock variants", value: String(stats.lowStockCount), href: "/admin/inventory" },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats.totalOrders} orders · {stats.pendingReviews} reviews awaiting moderation
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-serif text-2xl text-foreground">{c.value}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
              View <ArrowRight width={12} height={12} />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-medium text-foreground">Low stock</h2>
            <Link href="/admin/inventory" className="text-xs text-primary hover:underline">
              Manage inventory
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {lowStock.map(({ combo, product }) => {
                const opts = [combo.size, combo.color, combo.scent].filter(Boolean).join(" / ")
                return (
                  <li key={combo.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm text-foreground">{product?.name ?? "Product"}</p>
                      {opts && <p className="text-xs text-muted-foreground">{opts}</p>}
                    </div>
                    <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs text-accent">
                      {combo.availableQty} left
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <NotificationFeed notifications={notifications} />
      </div>
    </div>
  )
}
