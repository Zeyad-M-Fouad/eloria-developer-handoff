"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const dark = mounted && resolvedTheme === "dark"
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={compact ? "inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted" : "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
      {!compact && <span>{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  )
}
