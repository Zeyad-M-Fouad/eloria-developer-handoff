import Link from "next/link"
import { Download } from "lucide-react"
import { getSalesReport, getOverviewStats } from "@/backend/admin"
import { formatMoney } from "@/lib/money"

export const metadata = { title: "Reports" }
export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  const [report, stats] = await Promise.all([getSalesReport(), getOverviewStats()])
  const maxRevenue = report.products.reduce((m, p) => Math.max(m, p.revenueCents), 0)

  const summary = [
    { label: "Delivered revenue", value: formatMoney(report.deliveredRevenueCents) },
    { label: "Units delivered", value: String(report.deliveredUnits) },
    { label: "Gross collections (all orders)", value: formatMoney(stats.grossCollectionsCents) },
    { label: "Refunds (all orders)", value: formatMoney(stats.refundsCents) },
    { label: "Net collections (all orders)", value: formatMoney(stats.netCollectionsCents) },
    { label: "Deposits held (undelivered)", value: formatMoney(stats.depositsHeldCents) },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Delivered revenue and units use delivered orders; collection metrics include all orders.</p>
        </div>
        <Link
          href="/admin/export/orders"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/40"
        >
          <Download width={16} height={16} />
          Export orders CSV
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-serif text-2xl text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-border bg-card p-5">
        <h2 className="font-medium text-foreground">Revenue by product</h2>
        {report.products.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No delivered orders yet. Revenue appears here once orders are marked delivered.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {report.products.map((p) => (
              <li key={p.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{p.name}</span>
                  <span className="text-muted-foreground">
                    {p.units} units · {formatMoney(p.revenueCents)}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: maxRevenue ? `${Math.max(4, (p.revenueCents / maxRevenue) * 100)}%` : "0%" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
