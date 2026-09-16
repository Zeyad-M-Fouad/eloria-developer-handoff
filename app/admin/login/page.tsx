import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { adminExists } from "@/lib/admin/guard"
import { Card } from "@/components/ui/card"
import { AdminAuthForm } from "@/components/admin/admin-auth-form"

export const metadata = { title: "Admin sign in" }

export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/admin")

  const hasAdmin = await adminExists()
  if (!hasAdmin) redirect("/admin/register")

  return (
    <main className="flex min-h-svh items-center justify-center bg-secondary/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <p className="font-serif text-2xl font-semibold text-foreground">Eloria</p>
          <h1 className="mt-2 text-lg font-medium text-foreground">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage products, orders, and inventory.</p>
        </div>
        <AdminAuthForm mode="sign-in" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to store
          </Link>
        </p>
      </Card>
    </main>
  )
}
