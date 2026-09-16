import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getOrders, ORDER_STATES, type OrderState } from "@/lib/admin/queries"
import { ORDER_STATE_LABELS, PAYMENT_STATE_LABELS } from "@/lib/admin/labels"

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function money(cents: number): string {
  return (cents / 100).toFixed(2)
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const stateParam = url.searchParams.get("state")
  const state = ORDER_STATES.includes(stateParam as OrderState) ? (stateParam as OrderState) : undefined

  const orders = await getOrders(state)

  const header = [
    "Order code",
    "Date",
    "Email",
    "Phone",
    "Address",
    "Status",
    "Payment",
    "Subtotal",
    "Discount",
    "Agreed total",
    "Deposit",
  ]

  const lines = [header.map(csvCell).join(",")]
  for (const o of orders) {
    lines.push(
      [
        o.orderCode,
        new Date(o.createdAt).toISOString(),
        o.customerEmail,
        o.phone,
        o.address,
        ORDER_STATE_LABELS[o.orderState] ?? o.orderState,
        PAYMENT_STATE_LABELS[o.paymentState] ?? o.paymentState,
        money(o.subtotalCents),
        money(o.discountCents),
        o.agreedTotalCents != null ? money(o.agreedTotalCents) : "",
        money(o.depositCents),
      ]
        .map(csvCell)
        .join(","),
    )
  }

  const csv = lines.join("\n")
  const filename = `eloria-orders${state ? `-${state}` : ""}-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
