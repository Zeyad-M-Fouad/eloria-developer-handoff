import Link from "next/link"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/backend/auth"
import { adminExists } from "@/backend/admin"
import { Card } from "@/components/ui/card"
import { AdminAuthForm } from "@/components/admin/admin-auth-form"

export const metadata = { title: "Create admin account" }

export default async function AdminRegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/admin")

  // Registration is a one-time bootstrap. Once the owner exists, send to login.
  const hasAdmin = await adminExists()
  if (hasAdmin) redirect("/admin/login")

  return (
    <main className="flex min-h-svh items-center justify-center bg-secondary/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6">
          <p className="font-serif text-2xl font-semibold text-foreground">Eloria</p>
          <h1 className="mt-2 text-lg font-medium text-foreground">Create the admin account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This is a one-time setup for the shop owner. After this, registration closes.
          </p>
        </div>
        <AdminAuthForm mode="sign-up" />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to store
          </Link>
        </p>
      </Card>
    </main>
  )
}
