import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Mail, Phone, MapPin } from "lucide-react"
import { getOrderDetail } from "@/lib/admin/queries"
import { ORDER_STATE_LABELS, PAYMENT_STATE_LABELS, orderStateClass, paymentStateClass } from "@/lib/admin/labels"
import { OrderManager } from "@/components/admin/order-manager"
import { formatMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

export const metadata = { title: "Order detail" }
export const dynamic = "force-dynamic"

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const detail = await getOrderDetail(numericId)
  if (!detail) notFound()
  const { order, lines, payments } = detail

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/orders"
        className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft width={16} height={16} />
        All orders
      </Link>

      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl text-foreground">{order.orderCode}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-sm", orderStateClass(order.orderState))}>
            Fulfilment: {ORDER_STATE_LABELS[order.orderState] ?? order.orderState}
          </span>
          <span className={cn("rounded-full px-3 py-1 text-sm", paymentStateClass(order.paymentState))}>
            Payment: {PAYMENT_STATE_LABELS[order.paymentState] ?? order.paymentState}
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* Customer + items */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-medium text-foreground">Customer</h2>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Mail width={16} height={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="break-all text-foreground">{order.customerEmail}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone width={16} height={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-foreground">{order.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin width={16} height={16} className="mt-0.5 shrink-0 text-muted-foreground" />
                <span className="text-pretty text-foreground">{order.address}</span>
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-medium text-foreground">Items</h2>
            <ul className="mt-3 divide-y divide-border/60">
              {lines.map((l) => {
                const opts = [l.size, l.color, l.scent].filter(Boolean).join(" / ")
                return (
                  <li key={l.id} className="flex justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="text-foreground">{l.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.itemCode ? `${l.itemCode}` : ""}
                        {opts ? ` · ${opts}` : ""} · ×{l.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-foreground">{formatMoney(l.unitPriceCents * l.quantity)}</span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-3 flex justify-between border-t border-border/60 pt-3 text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{formatMoney(order.subtotalCents)}</span>
            </div>
            {order.discountCents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount applied</span>
                <span className="text-accent">−{formatMoney(order.discountCents)}</span>
              </div>
            )}
          </section>
        </div>

        <OrderManager
          order={{
            id: order.id,
            orderCode: order.orderCode,
            orderState: order.orderState,
            paymentState: order.paymentState,
            subtotalCents: order.subtotalCents,
            agreedTotalCents: order.agreedTotalCents,
            depositCents: order.depositCents,
            notes: order.notes,
          }}
          payments={payments}
        />
      </div>
    </div>
  )
}
