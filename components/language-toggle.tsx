"use client"

import { Languages } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function LanguageToggle() {
  const { isArabic, toggleLocale, t } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-foreground transition-colors hover:bg-muted"
      aria-label={isArabic ? t("nav.english") : t("nav.arabic")}
    >
      <Languages width={17} height={17} aria-hidden="true" />
      <span>{isArabic ? "EN" : "ع"}</span>
    </button>
  )
}
