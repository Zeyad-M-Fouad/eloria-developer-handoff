"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Locale = "en" | "ar"

type LanguageContextValue = {
  locale: Locale
  isArabic: boolean
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: string) => string
}

const translations: Record<string, string> = {
  "nav.shop": "Shop",
  "nav.faq": "FAQ",
  "nav.shipping": "Shipping",
  "nav.contact": "Contact",
  "nav.bag": "Bag",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",
  "nav.arabic": "العربية",
  "nav.english": "English",
  "home.eyebrow": "Small-batch skincare",
  "home.title": "Considered skincare, made personal",
  "home.description": "Botanical body care crafted in small batches. Choose your size and scent, then confirm your order with us directly over WhatsApp — no rushed checkout, just care.",
  "home.shop": "Shop the collection",
  "home.ordering": "How ordering works",
  "home.collection": "The collection",
  "home.collectionDescription": "A tightly edited range, made to be used every day.",
  "home.viewAll": "View all",
  "home.comingSoon": "Products are coming soon.",
  "home.kindWords": "Kind words",
  "home.loved": "Loved by thoughtful skin",
  "home.community": "A few notes from the Eloria community.",
  "home.getInTouch": "Get in touch",
  "home.help": "We're here to help",
  "home.helpDescription": "Have a question about a product or your order? Send us a message and we'll get back to you shortly.",

  "ar.nav.shop": "تسوقي المنتجات",
  "ar.nav.faq": "الأسئلة الشائعة",
  "ar.nav.shipping": "الشحن",
  "ar.nav.contact": "تواصل معنا",
  "ar.nav.bag": "الحقيبة",
  "ar.nav.openMenu": "فتح القائمة",
  "ar.nav.closeMenu": "إغلاق القائمة",
  "ar.nav.arabic": "العربية",
  "ar.nav.english": "English",
  "ar.home.eyebrow": "عناية بالبشرة بكميات صغيرة",
  "ar.home.title": "عناية مدروسة بالبشرة، مصممة لكِ",
  "ar.home.description": "منتجات عناية نباتية بالبشرة تُصنع على دفعات صغيرة. اختاري الحجم والرائحة، ثم أكدي طلبك معنا مباشرة عبر واتساب — بدون استعجال، وبكل اهتمام.",
  "ar.home.shop": "تسوقي المجموعة",
  "ar.home.ordering": "كيف يتم الطلب؟",
  "ar.home.collection": "المجموعة",
  "ar.home.collectionDescription": "مجموعة مختارة بعناية، مصممة للاستخدام اليومي.",
  "ar.home.viewAll": "عرض الكل",
  "ar.home.comingSoon": "المنتجات قريباً.",
  "ar.home.kindWords": "كلمات جميلة",
  "ar.home.loved": "محبوب من أصحاب البشرة الواعية",
  "ar.home.community": "بعض الكلمات من مجتمع Eloria.",
  "ar.home.getInTouch": "تواصلي معنا",
  "ar.home.help": "نحن هنا لمساعدتكِ",
  "ar.home.helpDescription": "لديكِ سؤال عن منتج أو طلب؟ أرسلي لنا رسالة وسنعود إليكِ قريباً.",
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  useEffect(() => {
    const saved = window.localStorage.getItem("eloria-locale")
    if (saved === "ar" || saved === "en") setLocaleState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    window.localStorage.setItem("eloria-locale", locale)
  }, [locale])

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    isArabic: locale === "ar",
    setLocale: (next) => setLocaleState(next),
    toggleLocale: () => setLocaleState((current) => current === "ar" ? "en" : "ar"),
    t: (key) => locale === "ar" ? translations[`ar.${key}`] ?? translations[key] ?? key : translations[key] ?? key,
  }), [locale])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
