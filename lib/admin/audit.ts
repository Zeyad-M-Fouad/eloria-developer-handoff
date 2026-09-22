import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { desc } from "drizzle-orm"

type AuditInput = {
  action: string
  entityType?: string
  entityId?: string | number
  details?: Record<string, unknown>
}

export async function logAdminAction(input: AuditInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return
  await db.insert(auditLogs).values({
    userId: session.user.id,
    userEmail: session.user.email,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId == null ? undefined : String(input.entityId),
    details: input.details ?? {},
  })
}

export async function getAuditLogs(limit = 100) {
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit)
}
