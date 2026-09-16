"use client"

import { useTransition } from "react"
import { Bell, Check } from "lucide-react"
import { markNotificationRead, markAllNotificationsRead } from "@/app/admin/actions"

type Notification = {
  id: number
  message: string
  isRead: boolean
  createdAt: Date | string
}

function timeAgo(d: Date | string) {
  const date = new Date(d)
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function NotificationFeed({ notifications }: { notifications: Notification[] }) {
  const [pending, startTransition] = useTransition()
  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Bell width={18} height={18} className="text-muted-foreground" />
          <h2 className="font-medium text-foreground">Activity</h2>
        </div>
        {hasUnread && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => void markAllNotificationsRead())}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="max-h-96 divide-y divide-border/60 overflow-y-auto">
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3 px-5 py-3.5">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-border" : "bg-accent"}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.isRead ? "text-muted-foreground" : "text-foreground"}`}>{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => startTransition(() => void markNotificationRead(n.id))}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Mark as read"
                >
                  <Check width={15} height={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
