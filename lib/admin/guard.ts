import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { count } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

/** Server-side authorization for admin pages and actions. */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/admin/login")
  return session
}

/** Whether the single owner account has been created yet. */
export async function adminExists(): Promise<boolean> {
  const [row] = await db.select({ value: count() }).from(userTable)
  return (row?.value ?? 0) > 0
}
