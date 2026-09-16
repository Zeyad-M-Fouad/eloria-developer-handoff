import Link from "next/link"
import { Download } from "lucide-react"
import { getOrders, ORDER_STATES, type OrderState } from "@/lib/admin/queries"
import { ORDER_STATE_LABELS, PAYMENT_STATE_LABELS, orderStateClass, paymentStateClass } from "@/lib/admin/labels"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

export const metadata = { title: "Orders" }

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>
}) {
  const { state } = await searchParams
  const activeState = ORDER_STATES.includes(state as OrderState) ? (state as OrderState) : undefined
  const orders = await getOrders(activeState)

  const exportHref = activeState ? `/admin/export/orders?state=${activeState}` : "/admin/export/orders"

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-foreground">Orders</h1>
        <Link
          href={exportHref}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40"
          prefetch={false}
        >
          <Download width={16} height={16} />
          Export CSV
        </Link>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        <FilterTab href="/admin/orders" active={!activeState}>
          All
        </FilterTab>
        {ORDER_STATES.map((s) => (
          <FilterTab key={s} href={`/admin/orders?state=${s}`} active={activeState === s}>
            {ORDER_STATE_LABELS[s]}
          </FilterTab>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-5 py-16 text-center text-muted-foreground">
          No orders here yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-foreground hover:underline">
                        {o.orderCode}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(o.createdAt)}</td>
                    <td className="max-w-[180px] truncate px-5 py-3.5 text-muted-foreground">{o.customerEmail}</td>
                    <td className="px-5 py-3.5 text-foreground">
                      {formatMoney(o.agreedTotalCents ?? o.subtotalCents)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs", orderStateClass(o.orderState))}>
                        {ORDER_STATE_LABELS[o.orderState] ?? o.orderState}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs", paymentStateClass(o.paymentState))}>
                        {PAYMENT_STATE_LABELS[o.paymentState] ?? o.paymentState}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterTab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </Link>
  )
}
