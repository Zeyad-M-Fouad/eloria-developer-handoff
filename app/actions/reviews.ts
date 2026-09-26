"use server"

import { db } from "@/backend/db"
import { reviews, orders, orderLines } from "@/backend/db"
import { and, eq } from "drizzle-orm"
import { createNotification } from "@/backend/notifications"

export type SubmitReviewInput = {
  productId: number
  orderCode: string
  authorName: string
  rating: number
  body: string
}

export type SubmitReviewResult = { ok: true } | { ok: false; error: string }

export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  const orderCode = input.orderCode?.trim().toUpperCase()
  const authorName = input.authorName?.trim()
  const body = input.body?.trim() ?? ""
  const rating = Number(input.rating)
  const productId = Number(input.productId)

  if (!Number.isInteger(productId) || productId <= 0) return { ok: false, error: "Invalid product." }
  if (!authorName) return { ok: false, error: "Please enter your name." }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return { ok: false, error: "Please choose a rating from 1 to 5 stars." }
  if (!orderCode) return { ok: false, error: "Please enter the order code from your purchase." }
  if (body.length > 1500) return { ok: false, error: "Please keep your review under 1500 characters." }

  // Order-code gating: the code must exist AND that order must include this product.
  const [order] = await db.select({ id: orders.id }).from(orders).where(eq(orders.orderCode, orderCode)).limit(1)
  if (!order) return { ok: false, error: "We couldn't find that order code. Please check and try again." }

  const [line] = await db
    .select({ id: orderLines.id })
    .from(orderLines)
    .where(and(eq(orderLines.orderId, order.id), eq(orderLines.productId, productId)))
    .limit(1)
  if (!line) return { ok: false, error: "That order code doesn't include this product." }

  // One review per order code per product.
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.orderCode, orderCode), eq(reviews.productId, productId)))
    .limit(1)
  if (existing) return { ok: false, error: "A review for this product already exists for that order code." }

  await db.insert(reviews).values({
    productId,
    orderCode,
    authorName,
    rating,
    body,
    status: "pending",
  })

  await createNotification({
    event: "review_submitted",
    relatedId: productId,
    message: `New review pending moderation · ${rating}★ · order ${orderCode}`,
    channel: "dashboard",
  })

  return { ok: true }
}
