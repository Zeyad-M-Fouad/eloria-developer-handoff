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
  "ar.Shop all": "تسوقي الكل",
  "ar.Your bag": "حقيبتكِ",
  "ar.Checkout": "إتمام الطلب",
  "ar.Shipping & delivery": "الشحن والتوصيل",
  "ar.Contact us": "تواصلي معنا",
  "ar.Send us a message": "أرسلي لنا رسالة",
  "ar.Write a review": "اكتبي تقييمًا",
  "ar.Place your request": "أرسلي طلبكِ",
  "ar.We confirm on WhatsApp": "نؤكد الطلب عبر واتساب",
  "ar.A small deposit": "عربون بسيط",
  "ar.On its way": "في الطريق إليكِ",
  "ar.Order confirmed": "تم تأكيد الطلب",
  "ar.Add to bag": "أضيفي إلى الحقيبة",
  "ar.View product": "عرض المنتج",
  "ar.Quantity": "الكمية",
  "ar.Price": "السعر",
  "ar.Total": "الإجمالي",
  "ar.Remove": "إزالة",
  "ar.Continue shopping": "متابعة التسوق",
  "ar.Submit order": "إرسال الطلب",
  "ar.Name": "الاسم",
  "ar.Email": "البريد الإلكتروني",
  "ar.Phone": "رقم الهاتف",
  "ar.Address": "العنوان",
  "ar.Message": "الرسالة",
  "ar.Submit": "إرسال",
  "ar.Loading": "جارٍ التحميل",
  "ar.No products found.": "لم يتم العثور على منتجات.",
  "ar.All": "الكل",
  "ar.Available": "متوفر",
  "ar.Out of stock": "غير متوفر",
  "ar.Size": "الحجم",
  "ar.Colour": "اللون",
  "ar.Scent": "الرائحة",
  "ar.We keep delivery personal. Rather than a fixed checkout, we confirm each order and its delivery cost with you directly — so you always know the total before anything is paid.": "نحافظ على تجربة توصيل شخصية. بدلًا من الدفع الثابت، نؤكد كل طلب وتكلفة توصيله معكِ مباشرة — لتعرفي الإجمالي قبل الدفع.",
  "ar.Delivery fees vary by location and are agreed before your deposit. No card details are ever taken on this site.": "تختلف رسوم التوصيل حسب الموقع ويتم الاتفاق عليها قبل العربون. لا نطلب بيانات البطاقات عبر هذا الموقع.",
  "ar.Add items to your bag and submit your details. You'll receive an order code straight away.": "أضيفي المنتجات إلى حقيبتكِ وأرسلي بياناتكِ. ستحصلين على رمز الطلب فورًا.",
  "ar.We check availability and agree the final total, including a delivery fee based on your address.": "نتحقق من التوفر ونتفق على الإجمالي النهائي، بما في ذلك رسوم التوصيل حسب عنوانكِ.",
  "ar.A light deposit secures your batch. The balance is settled on delivery.": "يضمن العربون البسيط تجهيز دفعتكِ، ويتم دفع المتبقي عند التوصيل.",
  "ar.Once your order is prepared and sent, we'll share tracking or delivery timing over WhatsApp.": "بعد تجهيز طلبكِ وإرساله، نشارككِ تفاصيل التتبع أو موعد التوصيل عبر واتساب.",
  "ar.Every Eloria order is handled personally. Reach us with your order code and we'll help with availability, delivery, or anything else.": "يتم التعامل مع كل طلب من Eloria بشكل شخصي. تواصلي معنا برمز الطلب وسنساعدكِ في التوفر والتوصيل أو أي استفسار آخر.",
  "ar.The fastest way to reach us for orders, deposits, and delivery. We confirm all orders here.": "أسرع طريقة للتواصل معنا بشأن الطلبات والعربون والتوصيل. نؤكد جميع الطلبات هنا.",
  "ar.Prefer email? Send us your order code and question and we'll get back to you.": "تفضلين البريد الإلكتروني؟ أرسلي رمز الطلب وسؤالكِ وسنرد عليكِ.",
  "ar.We reply to messages daily. Orders placed overnight are confirmed the next morning.": "نرد على الرسائل يوميًا. يتم تأكيد الطلبات المرسلة ليلًا في صباح اليوم التالي.",
  "ar.For order-related questions, include your order code so we can help quickly.": "للاستفسارات المتعلقة بالطلب، أضيفي رمز الطلب لنتمكن من مساعدتكِ بسرعة.",
  "ar.Everything we make, in one place. Choose a size and scent on each product, then reserve by WhatsApp.": "كل ما نصنعه في مكان واحد. اختاري الحجم والرائحة لكل منتج، ثم احجزي عبر واتساب.",
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

    const translatePage = () => {
      const nodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const textNodes: Text[] = []
      let node: Node | null
      while ((node = nodes.nextNode())) textNodes.push(node as Text)
      for (const textNode of textNodes) {
        const original = textNode.nodeValue?.trim()
        if (!original || textNode.parentElement?.closest("script,style,[data-no-translate]")) continue
        const key = locale === "ar" ? `ar.${original}` : original
        const englishKey = locale === "en" ? Object.entries(translations).find(([entryKey, value]) => entryKey.startsWith("ar.") && value === original)?.[0].slice(3) : undefined
        const translated = translations[key] ?? (englishKey ? translations[englishKey] : undefined)
        if (translated && textNode.nodeValue) {
          const leading = textNode.nodeValue.match(/^\\s*/)?.[0] ?? ""
          const trailing = textNode.nodeValue.match(/\\s*$/)?.[0] ?? ""
          textNode.nodeValue = `${leading}${translated}${trailing}`
        }
      }
      for (const element of Array.from(document.querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder], [aria-label], title"))) {
        const attribute = element.hasAttribute("placeholder") ? "placeholder" : element.hasAttribute("aria-label") ? "aria-label" : "title"
        const value = element.getAttribute(attribute)
        if (value) element.setAttribute(attribute, translations[locale === "ar" ? `ar.${value}` : value] ?? value)
      }
    }

    translatePage()
    const observer = new MutationObserver(() => translatePage())
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
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
