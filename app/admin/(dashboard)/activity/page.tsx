import { getAuditLogs } from "@/backend/admin"

export const dynamic = "force-dynamic"
export const metadata = { title: "Activity log" }

function formatAction(action: string) {
  return action.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default async function ActivityLogPage() {
  const logs = await getAuditLogs()

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl text-foreground">Activity log</h1>
        <p className="mt-1 text-sm text-muted-foreground">A record of admin changes and actions.</p>
      </header>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {logs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No admin activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {[...logs].reverse().map((log) => (
              <li key={log.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{formatAction(log.action)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {log.userEmail}{log.entityType ? ` · ${log.entityType}${log.entityId ? ` #${log.entityId}` : ""}` : ""}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground" dateTime={log.createdAt.toISOString()}>
                  {log.createdAt.toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
