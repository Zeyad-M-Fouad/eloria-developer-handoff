import Link from "next/link"
import { getReturns } from "@/lib/admin/queries"
import { cn } from "@/lib/utils"

export const metadata = { title: "Cancellations & returns" }
export const dynamic = "force-dynamic"

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default async function ReturnsPage() {
  const rows = await getReturns()

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Cancellations &amp; returns</h1>
        <p className="mt-1 text-sm text-muted-foreground">Logged from each order&apos;s detail page.</p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-5 py-16 text-center text-muted-foreground">
          No cancellations or returns logged.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ record, orderCode }) => (
            <li key={record.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground">{record.refCode}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs capitalize",
                        record.type === "return" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {record.type}
                    </span>
                    {record.receivedBack && (
                      <span className="rounded-full bg-primary/12 px-2.5 py-0.5 text-xs text-primary">Received back</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-foreground">{record.outcome || "No outcome recorded"}</p>
                  {record.note && <p className="mt-1 text-sm text-muted-foreground">{record.note}</p>}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <Link href={`/admin/orders/${record.orderId}`} className="font-mono text-primary hover:underline">
                    {orderCode}
                  </Link>
                  <p className="mt-1">{formatDate(record.createdAt)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
