import { db } from "@/lib/db"
import {
  products,
  productCombinations,
  categories,
  orders,
  orderLines,
  paymentRecords,
  reviews,
  notifications,
  cancellationsReturns,
} from "@/lib/db/schema"
import { and, eq, desc, inArray, lte, sql } from "drizzle-orm"

import { ORDER_STATES, PAYMENT_STATES, type OrderState, type PaymentState } from "@/lib/admin/labels"

export { ORDER_STATES, PAYMENT_STATES, type OrderState, type PaymentState } from "@/lib/admin/labels"

export async function getOverviewStats() {
  const [orderAgg] = await db
    .select({
      total: sql<number>`count(*)::int`,
      pending: sql<number>`count(*) filter (where ${orders.orderState} = 'pending')::int`,
      delivered: sql<number>`count(*) filter (where ${orders.orderState} = 'delivered')::int`,
    })
    .from(orders)

  const [revenueAgg] = await db
    .select({
      deliveredRevenue: sql<number>`coalesce(sum(coalesce(${orders.agreedTotalCents}, ${orders.subtotalCents})) filter (where ${orders.orderState} = 'delivered'), 0)::int`,
      depositsHeld: sql<number>`coalesce(sum(${orders.depositCents}) filter (where ${orders.orderState} not in ('delivered','cancelled')), 0)::int`,
    })
    .from(orders)

  const [paymentsAgg] = await db
    .select({ collected: sql<number>`coalesce(sum(${paymentRecords.amountCents}) filter (where ${paymentRecords.kind} != 'refund'), 0)::int` })
    .from(paymentRecords)

  const [lowStockAgg] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(productCombinations)
    .where(sql`${productCombinations.availableQty} <= ${productCombinations.lowStockThreshold}`)

  const [reviewAgg] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(reviews)
    .where(eq(reviews.status, "pending"))

  const [notifAgg] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(notifications)
    .where(eq(notifications.isRead, false))

  return {
    totalOrders: orderAgg?.total ?? 0,
    pendingOrders: orderAgg?.pending ?? 0,
    deliveredOrders: orderAgg?.delivered ?? 0,
    deliveredRevenueCents: revenueAgg?.deliveredRevenue ?? 0,
    depositsHeldCents: revenueAgg?.depositsHeld ?? 0,
    collectedCents: paymentsAgg?.collected ?? 0,
    lowStockCount: lowStockAgg?.value ?? 0,
    pendingReviews: reviewAgg?.value ?? 0,
    unreadNotifications: notifAgg?.value ?? 0,
  }
}

export async function getRecentNotifications(limit = 12) {
  return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(limit)
}

export type AdminOrderRow = typeof orders.$inferSelect
export async function getOrders(state?: OrderState): Promise<AdminOrderRow[]> {
  if (state) return db.select().from(orders).where(eq(orders.orderState, state)).orderBy(desc(orders.createdAt))
  return db.select().from(orders).orderBy(desc(orders.createdAt))
}

export async function getOrderDetail(id: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order) return null
  const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, id))
  const payments = await db
    .select()
    .from(paymentRecords)
    .where(eq(paymentRecords.orderId, id))
    .orderBy(desc(paymentRecords.createdAt))
  return { order, lines, payments }
}

export type AdminProduct = typeof products.$inferSelect & {
  categoryName: string | null
  combinations: (typeof productCombinations.$inferSelect)[]
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt))
  const cats = await db.select().from(categories)
  const catMap = new Map(cats.map((c) => [c.id, c.name]))
  const ids = rows.map((r) => r.id)
  const combos = ids.length
    ? await db.select().from(productCombinations).where(inArray(productCombinations.productId, ids))
    : []
  return rows.map((p) => ({
    ...p,
    categoryName: p.categoryId != null ? (catMap.get(p.categoryId) ?? null) : null,
    combinations: combos.filter((c) => c.productId === p.id),
  }))
}

export async function getAdminProduct(id: number) {
  const [p] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!p) return null
  const combos = await db.select().from(productCombinations).where(eq(productCombinations.productId, id))
  return { product: p, combinations: combos }
}

export async function getCategoriesList() {
  return db.select().from(categories).orderBy(categories.name)
}

export async function getLowStockCombinations() {
  const combos = await db
    .select()
    .from(productCombinations)
    .where(sql`${productCombinations.availableQty} <= ${productCombinations.lowStockThreshold}`)
  const ids = [...new Set(combos.map((c) => c.productId))]
  const prods = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : []
  const map = new Map(prods.map((p) => [p.id, p]))
  return combos.map((c) => ({ combo: c, product: map.get(c.productId) ?? null }))
}

export async function getAllCombinationsWithProduct() {
  const combos = await db.select().from(productCombinations).orderBy(productCombinations.productId)
  const ids = [...new Set(combos.map((c) => c.productId))]
  const prods = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : []
  const map = new Map(prods.map((p) => [p.id, p]))
  return combos.map((c) => ({ combo: c, product: map.get(c.productId) ?? null }))
}

export async function getReviewsByStatus(status: "pending" | "published" | "rejected") {
  const items = await db.select().from(reviews).where(eq(reviews.status, status)).orderBy(desc(reviews.createdAt))
  const ids = [...new Set(items.map((r) => r.productId))]
  const prods = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : []
  const map = new Map(prods.map((p) => [p.id, p.name]))
  return items.map((r) => ({ review: r, productName: map.get(r.productId) ?? "Product" }))
}

export async function getReturns() {
  const rows = await db.select().from(cancellationsReturns).orderBy(desc(cancellationsReturns.createdAt))
  const ids = [...new Set(rows.map((r) => r.orderId))]
  const ords = ids.length ? await db.select().from(orders).where(inArray(orders.id, ids)) : []
  const map = new Map(ords.map((o) => [o.id, o.orderCode]))
  return rows.map((r) => ({ record: r, orderCode: map.get(r.orderId) ?? "—" }))
}

export async function getSalesReport() {
  // Revenue by category (delivered orders), and unit counts.
  const rows = await db
    .select({
      productName: orderLines.productName,
      quantity: orderLines.quantity,
      unitPriceCents: orderLines.unitPriceCents,
      orderState: orders.orderState,
    })
    .from(orderLines)
    .innerJoin(orders, eq(orderLines.orderId, orders.id))

  const byProduct = new Map<string, { units: number; revenueCents: number }>()
  let deliveredUnits = 0
  let deliveredRevenue = 0
  for (const r of rows) {
    if (r.orderState !== "delivered") continue
    const cur = byProduct.get(r.productName) ?? { units: 0, revenueCents: 0 }
    cur.units += r.quantity
    cur.revenueCents += r.quantity * r.unitPriceCents
    byProduct.set(r.productName, cur)
    deliveredUnits += r.quantity
    deliveredRevenue += r.quantity * r.unitPriceCents
  }
  const products = [...byProduct.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
  return { products, deliveredUnits, deliveredRevenueCents: deliveredRevenue }
}
