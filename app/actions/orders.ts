"use server"

import { db } from "@/lib/db"
import { orders, orderLines, productCombinations, products } from "@/lib/db/schema"
import { eq, inArray } from "drizzle-orm"
import { effectivePriceCents } from "@/lib/money"
import { generateOrderCode } from "@/lib/store/order-code"
import { createNotification, sendBusinessEmail } from "@/lib/notifications"
import { formatMoney } from "@/lib/money"

export type SubmitOrderItem = { combinationId: number; quantity: number }

export type SubmitOrderInput = {
  items: SubmitOrderItem[]
  email: string
  phone: string
  address: string
}

export type SubmitOrderResult = { ok: true; orderCode: string } | { ok: false; error: string }

const MAX_QTY_PER_LINE = 99
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitOrder(input: SubmitOrderInput): Promise<SubmitOrderResult> {
  const email = input.email?.trim()
  const phone = input.phone?.trim()
  const address = input.address?.trim()

  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email address." }
  if (!phone || phone.replace(/[^\d]/g, "").length < 7)
    return { ok: false, error: "Please enter a valid WhatsApp phone number." }
  if (!address || address.length < 8) return { ok: false, error: "Please enter your full delivery address." }
  if (!Array.isArray(input.items) || input.items.length === 0)
    return { ok: false, error: "Your bag is empty." }

  // Normalise + validate quantities (aggregate per combination).
  const qtyByCombo = new Map<number, number>()
  for (const it of input.items) {
    const id = Number(it.combinationId)
    const q = Number(it.quantity)
    if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "Invalid item in bag." }
    if (!Number.isInteger(q) || q <= 0) return { ok: false, error: "Quantities must be whole numbers." }
    qtyByCombo.set(id, (qtyByCombo.get(id) ?? 0) + q)
  }
  for (const q of qtyByCombo.values()) {
    if (q > MAX_QTY_PER_LINE) return { ok: false, error: `You can request at most ${MAX_QTY_PER_LINE} of one item.` }
  }

  const comboIds = [...qtyByCombo.keys()]
  const combos = await db.select().from(productCombinations).where(inArray(productCombinations.id, comboIds))
  if (combos.length !== comboIds.length) return { ok: false, error: "Some items are no longer available." }

  const productIds = [...new Set(combos.map((c) => c.productId))]
  const prods = await db.select().from(products).where(inArray(products.id, productIds))
  const prodMap = new Map(prods.map((p) => [p.id, p]))

  // Recompute all money server-side; never trust client prices.
  let subtotalCents = 0
  let discountCents = 0
  const lines = combos.map((c) => {
    const qty = qtyByCombo.get(c.id) as number
    const p = prodMap.get(c.productId)
    const unit = effectivePriceCents(c.priceCents, c.salePriceCents)
    const lineDiscount = (c.priceCents - unit) * qty
    subtotalCents += unit * qty
    discountCents += lineDiscount
    return {
      combinationId: c.id,
      productId: c.productId,
      productName: p?.name ?? "Product",
      itemCode: p?.itemCode ?? null,
      size: c.size,
      color: c.color,
      scent: c.scent,
      quantity: qty,
      unitPriceCents: unit,
      discountCents: lineDiscount,
    }
  })

  // Unique order code with a few retries on collision.
  let orderCode = generateOrderCode()
  let orderId: number | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [row] = await db
        .insert(orders)
        .values({
          orderCode,
          customerEmail: email,
          phone,
          address,
          orderState: "pending",
          paymentState: "unpaid",
          subtotalCents,
          discountCents,
          depositCents: 0,
        })
        .returning({ id: orders.id })
      orderId = row.id
      break
    } catch (err: any) {
      if (String(err?.message ?? "").includes("orderCode") || err?.code === "23505") {
        orderCode = generateOrderCode()
        continue
      }
      console.error("[v0] submitOrder insert failed:", err)
      return { ok: false, error: "Something went wrong submitting your order. Please try again." }
    }
  }
  if (orderId == null) return { ok: false, error: "Could not create your order. Please try again." }

  await db.insert(orderLines).values(lines.map((l) => ({ ...l, orderId: orderId as number })))

  // Pending requests do NOT reserve or deduct inventory (ORD-04 / INV-02).

  const itemSummary = lines
    .map((l) => {
      const opts = [l.size, l.color, l.scent].filter(Boolean).join(" / ")
      return `- ${l.productName}${opts ? ` (${opts})` : ""} x${l.quantity} @ ${formatMoney(l.unitPriceCents)}`
    })
    .join("\n")

  await createNotification({
    event: "order_submitted",
    relatedId: orderId,
    message: `New order ${orderCode} · ${formatMoney(subtotalCents)} · ${email}`,
    channel: "dashboard",
  })

  await sendBusinessEmail(
    `New Eloria order ${orderCode}`,
    `Order code: ${orderCode}\nEmail: ${email}\nPhone (WhatsApp): ${phone}\nAddress: ${address}\n\nItems:\n${itemSummary}\n\nSubtotal: ${formatMoney(subtotalCents)}\nDiscount: ${formatMoney(discountCents)}\n\nShipping is confirmed separately with the customer.`,
  )

  return { ok: true, orderCode }
}
