import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"

type CreateNotificationInput = {
  event: string
  relatedId?: number | null
  message: string
  channel?: "dashboard" | "email"
}

/** Records a dashboard notification. Never throws into the caller's flow. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  try {
    await db.insert(notifications).values({
      event: input.event,
      relatedId: input.relatedId ?? null,
      message: input.message,
      channel: input.channel ?? "dashboard",
    })
  } catch (err) {
    console.error("[v0] createNotification failed:", err)
  }
}

/**
 * Best-effort business email. If no email provider is configured we log the
 * payload instead of failing — the order must survive a notification failure
 * (see engineering recommendations in the spec). Wire a real provider (e.g.
 * Resend) here later without touching the order flow.
 */
export async function sendBusinessEmail(subject: string, body: string): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] business email (no provider configured):", subject, "\n", body)
      return
    }
    // Placeholder for a real provider call. Kept non-fatal on purpose.
    console.log("[v0] business email queued:", subject)
  } catch (err) {
    console.error("[v0] sendBusinessEmail failed:", err)
  }
}
