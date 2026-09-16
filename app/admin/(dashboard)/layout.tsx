import { requireAdmin } from "@/lib/admin/guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()

  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <AdminSidebar email={session.user.email} />
      <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  )
}
