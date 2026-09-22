"use server"

import { db } from "@/lib/db"
import {
  products,
  productCombinations,
  categories,
  orders,
  orderLines,
  paymentRecords,
  inventoryMovements,
  reviews,
  notifications,
  cancellationsReturns,
} from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin/guard"
import { createNotification } from "@/lib/notifications"
import { generateRefCode } from "@/lib/store/order-code"
import { ORDER_STATES, PAYMENT_STATES, type OrderState } from "@/lib/admin/queries"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/* ------------------------------- Inventory ------------------------------ */

async function applyInventoryForOrder(orderId: number, direction: -1 | 1, reason: string) {
  const lines = await db.select().from(orderLines).where(eq(orderLines.orderId, orderId))
  for (const line of lines) {
    if (line.combinationId == null) continue
    // direction -1 = deliver (deduct available, add delivered)
    // direction +1 = reverse  (restore available, subtract delivered)
    const change = direction * line.quantity
    await db
      .update(productCombinations)
      .set({
        availableQty: sql`greatest(0, ${productCombinations.availableQty} + ${change})`,
        deliveredQty: sql`greatest(0, ${productCombinations.deliveredQty} - ${change})`,
      })
      .where(eq(productCombinations.id, line.combinationId))

    await db.insert(inventoryMovements).values({
      combinationId: line.combinationId,
      orderId,
      quantityChange: change,
      reason,
    })

    await maybeLowStockAlert(line.combinationId)
  }
}

async function maybeLowStockAlert(combinationId: number) {
  const [c] = await db.select().from(productCombinations).where(eq(productCombinations.id, combinationId)).limit(1)
  if (!c) return
  if (c.availableQty <= c.lowStockThreshold && !c.lowStockAlerted) {
    await db.update(productCombinations).set({ lowStockAlerted: true }).where(eq(productCombinations.id, combinationId))
    const [p] = await db.select().from(products).where(eq(products.id, c.productId)).limit(1)
    const opts = [c.size, c.color, c.scent].filter(Boolean).join(" / ")
    await createNotification({
      event: "low_stock",
      relatedId: combinationId,
      message: `Low stock: ${p?.name ?? "Product"}${opts ? ` (${opts})` : ""} — ${c.availableQty} left`,
    })
  }
  if (c.availableQty > c.lowStockThreshold && c.lowStockAlerted) {
    await db.update(productCombinations).set({ lowStockAlerted: false }).where(eq(productCombinations.id, combinationId))
  }
}

export async function adjustStock(combinationId: number, delta: number, reason: string) {
  await requireAdmin()
  if (!Number.isInteger(delta) || delta === 0) return { ok: false as const, error: "Enter a non-zero whole number." }
  await db
    .update(productCombinations)
    .set({ availableQty: sql`greatest(0, ${productCombinations.availableQty} + ${delta})` })
    .where(eq(productCombinations.id, combinationId))
  await db.insert(inventoryMovements).values({
    combinationId,
    quantityChange: delta,
    reason: reason || (delta > 0 ? "restock" : "adjustment"),
  })
  await maybeLowStockAlert(combinationId)
  revalidatePath("/admin/inventory")
  revalidatePath("/admin/products")
  return { ok: true as const }
}

export async function setOnTheWay(combinationId: number, qty: number) {
  await requireAdmin()
  if (!Number.isInteger(qty) || qty < 0) return { ok: false as const, error: "Enter a valid quantity." }
  await db.update(productCombinations).set({ onTheWayQty: qty }).where(eq(productCombinations.id, combinationId))
  revalidatePath("/admin/inventory")
  return { ok: true as const }
}

export async function receiveOnTheWay(combinationId: number, qty: number) {
  await requireAdmin()
  const [c] = await db.select().from(productCombinations).where(eq(productCombinations.id, combinationId)).limit(1)
  if (!c) return { ok: false as const, error: "Not found." }
  const received = Math.min(qty, c.onTheWayQty)
  if (received <= 0) return { ok: false as const, error: "Nothing to receive." }
  await db
    .update(productCombinations)
    .set({
      availableQty: sql`${productCombinations.availableQty} + ${received}`,
      onTheWayQty: sql`${productCombinations.onTheWayQty} - ${received}`,
    })
    .where(eq(productCombinations.id, combinationId))
  await db.insert(inventoryMovements).values({ combinationId, quantityChange: received, reason: "received_shipment" })
  await maybeLowStockAlert(combinationId)
  revalidatePath("/admin/inventory")
  return { ok: true as const }
}

/* --------------------------------- Orders -------------------------------- */

export async function updateOrderState(orderId: number, newState: OrderState) {
  await requireAdmin()
  if (!ORDER_STATES.includes(newState)) return { ok: false as const, error: "Invalid state." }
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return { ok: false as const, error: "Order not found." }
  const prev = order.orderState

  if (prev !== "delivered" && newState === "delivered") {
    await applyInventoryForOrder(orderId, -1, "order_delivered")
  } else if (prev === "delivered" && newState !== "delivered") {
    await applyInventoryForOrder(orderId, 1, "order_delivery_reversed")
  }

  await db.update(orders).set({ orderState: newState, updatedAt: new Date() }).where(eq(orders.id, orderId))
  await createNotification({
    event: "order_state",
    relatedId: orderId,
    message: `Order ${order.orderCode} → ${newState.replace(/_/g, " ")}`,
  })
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin")
  return { ok: true as const }
}

async function recomputePaymentState(orderId: number) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) return
  const payments = await db.select().from(paymentRecords).where(eq(paymentRecords.orderId, orderId))
  const refunds = payments.filter((p) => p.kind === "refund").reduce((s, p) => s + p.amountCents, 0)
  const paid = payments.filter((p) => p.kind !== "refund").reduce((s, p) => s + p.amountCents, 0)
  const deposit = payments.filter((p) => p.kind === "deposit").reduce((s, p) => s + p.amountCents, 0)
  const target = order.agreedTotalCents ?? order.subtotalCents

  let state: (typeof PAYMENT_STATES)[number] = "unpaid"
  if (refunds > 0 && paid - refunds <= 0) state = "refunded"
  else if (target > 0 && paid >= target) state = "paid_in_full"
  else if (paid > 0) state = "deposit_paid"

  await db.update(orders).set({ paymentState: state, depositCents: deposit }).where(eq(orders.id, orderId))
}

export async function recordPayment(input: {
  orderId: number
  kind: "deposit" | "balance" | "full" | "refund"
  amountCents: number
  note?: string
}) {
  await requireAdmin()
  const { orderId, kind, amountCents } = input
  if (!["deposit", "balance", "full", "refund"].includes(kind)) return { ok: false as const, error: "Invalid type." }
  if (!Number.isInteger(amountCents) || amountCents <= 0) return { ok: false as const, error: "Enter a valid amount." }
  await db.insert(paymentRecords).values({ orderId, kind, amountCents, note: input.note ?? "" })
  await recomputePaymentState(orderId)
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
  return { ok: true as const }
}

export async function setAgreedTotal(orderId: number, agreedTotalCents: number | null) {
  await requireAdmin()
  if (agreedTotalCents != null && (!Number.isInteger(agreedTotalCents) || agreedTotalCents < 0))
    return { ok: false as const, error: "Enter a valid total." }
  await db.update(orders).set({ agreedTotalCents, updatedAt: new Date() }).where(eq(orders.id, orderId))
  await recomputePaymentState(orderId)
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true as const }
}

export async function updateOrderNotes(orderId: number, notes: string) {
  await requireAdmin()
  await db.update(orders).set({ notes, updatedAt: new Date() }).where(eq(orders.id, orderId))
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true as const }
}

export async function createReturn(input: {
  orderId: number
  type: "cancellation" | "return"
  outcome: string
  note: string
  receivedBack: boolean
}) {
  await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1)
  if (!order) return { ok: false as const, error: "Order not found." }
  const refCode = generateRefCode(input.type === "return" ? "RET" : "CAN")
  await db.insert(cancellationsReturns).values({
    refCode,
    orderId: input.orderId,
    type: input.type,
    outcome: input.outcome,
    note: input.note,
    receivedBack: input.receivedBack,
    affectedItems: [],
  })
  await createNotification({
    event: input.type === "return" ? "return_logged" : "cancellation_logged",
    relatedId: input.orderId,
    message: `${input.type === "return" ? "Return" : "Cancellation"} ${refCode} logged for ${order.orderCode}`,
  })
  revalidatePath("/admin/returns")
  revalidatePath(`/admin/orders/${input.orderId}`)
  return { ok: true as const, refCode }
}

/* ------------------------------- Categories ------------------------------ */

export async function createCategory(name: string) {
  await requireAdmin()
  const trimmed = name.trim().replace(/\s+/g, " ")
  if (!trimmed) return { ok: false as const, error: "Category name is required." }
  const slug = slugify(trimmed)
  if (!slug) return { ok: false as const, error: "Enter a valid category name." }
  try {
    const [category] = await db.insert(categories).values({ name: trimmed, slug }).returning()
    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { ok: true as const, category }
  } catch (err: any) {
    if (err?.code === "23505") return { ok: false as const, error: "That category already exists." }
    console.error("[v0] createCategory failed:", err)
    return { ok: false as const, error: "Could not create category." }
  }
}

export async function updateCategory(id: number, name: string) {
  await requireAdmin()
  const trimmed = name.trim().replace(/\s+/g, " ")
  if (!Number.isInteger(id) || !trimmed) return { ok: false as const, error: "Enter a valid category name." }
  const slug = slugify(trimmed)
  try {
    const [category] = await db
      .update(categories)
      .set({ name: trimmed, slug })
      .where(eq(categories.id, id))
      .returning()
    if (!category) return { ok: false as const, error: "Category not found." }
    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { ok: true as const, category }
  } catch (err: any) {
    if (err?.code === "23505") return { ok: false as const, error: "That category already exists." }
    console.error("[v0] updateCategory failed:", err)
    return { ok: false as const, error: "Could not update category." }
  }
}

export async function deleteCategory(id: number) {
  await requireAdmin()
  if (!Number.isInteger(id)) return { ok: false as const, error: "Invalid category." }
  try {
    await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id))
    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id })
    if (deleted.length === 0) return { ok: false as const, error: "Category not found." }
    revalidatePath("/admin/categories")
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { ok: true as const }
  } catch (err) {
    console.error("[v0] deleteCategory failed:", err)
    return { ok: false as const, error: "Could not delete category." }
  }
}

/* -------------------------------- Products ------------------------------- */

type CombinationInput = {
  size?: string | null
  color?: string | null
  scent?: string | null
  priceCents: number
  salePriceCents?: number | null
  availableQty: number
  lowStockThreshold?: number
}

export async function createProduct(input: {
  name: string
  itemCode: string
  description: string
  categoryId: number | null
  images: string[]
  ingredients: string
  usageInstructions: string
  isActive: boolean
  combinations: CombinationInput[]
}) {
  await requireAdmin()
  if (!input.name.trim()) return { ok: false as const, error: "Name is required." }
  if (!input.itemCode.trim()) return { ok: false as const, error: "Item code is required." }
  if (input.combinations.length === 0) return { ok: false as const, error: "Add at least one variant." }

  const slug = slugify(input.name)
  try {
    const [product] = await db
      .insert(products)
      .values({
        name: input.name.trim(),
        itemCode: input.itemCode.trim(),
        slug,
        description: input.description,
        categoryId: input.categoryId,
        images: input.images,
        ingredients: input.ingredients,
        usageInstructions: input.usageInstructions,
        isActive: input.isActive,
      })
      .returning({ id: products.id })

    for (const c of input.combinations) {
      await db.insert(productCombinations).values({
        productId: product.id,
        size: c.size || null,
        color: c.color || null,
        scent: c.scent || null,
        priceCents: c.priceCents,
        salePriceCents: c.salePriceCents ?? null,
        availableQty: c.availableQty,
        lowStockThreshold: c.lowStockThreshold ?? 5,
      })
    }
    revalidatePath("/admin/products")
    return { ok: true as const, id: product.id }
  } catch (err: any) {
    if (err?.code === "23505") return { ok: false as const, error: "Item code or name already exists." }
    console.error("[v0] createProduct failed:", err)
    return { ok: false as const, error: "Could not create product." }
  }
}

export async function updateProduct(input: {
  id: number
  name: string
  itemCode: string
  description: string
  categoryId: number | null
  images: string[]
  ingredients: string
  usageInstructions: string
  isActive: boolean
}) {
  await requireAdmin()
  try {
    await db
      .update(products)
      .set({
        name: input.name.trim(),
        itemCode: input.itemCode.trim(),
        slug: slugify(input.name),
        description: input.description,
        categoryId: input.categoryId,
        images: input.images,
        ingredients: input.ingredients,
        usageInstructions: input.usageInstructions,
        isActive: input.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, input.id))
    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${input.id}`)
    return { ok: true as const }
  } catch (err: any) {
    if (err?.code === "23505") return { ok: false as const, error: "Item code or name already exists." }
    console.error("[v0] updateProduct failed:", err)
    return { ok: false as const, error: "Could not update product." }
  }
}

export async function toggleProductActive(id: number, isActive: boolean) {
  await requireAdmin()
  await db.update(products).set({ isActive, updatedAt: new Date() }).where(eq(products.id, id))
  revalidatePath("/admin/products")
  return { ok: true as const }
}

export async function upsertCombination(input: {
  id?: number
  productId: number
  size?: string | null
  color?: string | null
  scent?: string | null
  priceCents: number
  salePriceCents?: number | null
  availableQty: number
  lowStockThreshold?: number
}) {
  await requireAdmin()
  if (!Number.isInteger(input.priceCents) || input.priceCents < 0)
    return { ok: false as const, error: "Enter a valid price." }
  if (input.salePriceCents != null && input.salePriceCents >= input.priceCents)
    return { ok: false as const, error: "Sale price must be below the regular price." }

  if (input.id) {
    await db
      .update(productCombinations)
      .set({
        size: input.size || null,
        color: input.color || null,
        scent: input.scent || null,
        priceCents: input.priceCents,
        salePriceCents: input.salePriceCents ?? null,
        availableQty: input.availableQty,
        lowStockThreshold: input.lowStockThreshold ?? 5,
      })
      .where(eq(productCombinations.id, input.id))
    await maybeLowStockAlert(input.id)
  } else {
    await db.insert(productCombinations).values({
      productId: input.productId,
      size: input.size || null,
      color: input.color || null,
      scent: input.scent || null,
      priceCents: input.priceCents,
      salePriceCents: input.salePriceCents ?? null,
      availableQty: input.availableQty,
      lowStockThreshold: input.lowStockThreshold ?? 5,
    })
  }
  revalidatePath(`/admin/products/${input.productId}`)
  revalidatePath("/admin/products")
  return { ok: true as const }
}

export async function deleteCombination(id: number, productId: number) {
  await requireAdmin()
  await db.delete(productCombinations).where(eq(productCombinations.id, id))
  revalidatePath(`/admin/products/${productId}`)
  return { ok: true as const }
}

/* -------------------------------- Reviews -------------------------------- */

export async function moderateReview(id: number, status: "published" | "rejected") {
  await requireAdmin()
  await db
    .update(reviews)
    .set({ status, ...(status === "rejected" ? { featuredOnHome: false } : {}) })
    .where(eq(reviews.id, id))
  revalidatePath("/admin/reviews")
  revalidatePath("/admin")
  revalidatePath("/")
  return { ok: true as const }
}

export async function setReviewFeaturedOnHome(id: number, featured: boolean) {
  await requireAdmin()
  await db.update(reviews).set({ featuredOnHome: featured }).where(eq(reviews.id, id))
  revalidatePath("/admin/reviews")
  revalidatePath("/")
  return { ok: true as const }
}

export async function deleteReview(id: number) {
  await requireAdmin()
  await db.delete(reviews).where(eq(reviews.id, id))
  revalidatePath("/admin/reviews")
  revalidatePath("/admin")
  revalidatePath("/")
  return { ok: true as const }
}

/* ----------------------------- Notifications ----------------------------- */

export async function markNotificationRead(id: number) {
  await requireAdmin()
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id))
  revalidatePath("/admin")
  return { ok: true as const }
}

export async function markAllNotificationsRead() {
  await requireAdmin()
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.isRead, false))
  revalidatePath("/admin")
  return { ok: true as const }
}
