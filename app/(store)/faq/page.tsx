import type { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about ordering, deposits, delivery, and reviews at Eloria.",
}

const FAQS = [
  {
    q: "How does ordering work?",
    a: "Add the items you'd like to your bag and submit your details. You'll get an order code, then we confirm availability, the final total, and delivery over WhatsApp.",
  },
  {
    q: "Do I pay on the website?",
    a: "No. We don't take card details online. After you place your request, we agree a small deposit over WhatsApp to secure your order, with the balance settled on delivery.",
  },
  {
    q: "Why is there a deposit?",
    a: "Because everything is made in small batches, a light deposit lets us reserve your items and prepare your order with confidence. It comes off your final total.",
  },
  {
    q: "How much is delivery?",
    a: "Delivery depends on your location. We'll confirm the exact fee with you before any deposit, so you always know the full total first.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Yes — just message us with your order code before it ships and we'll help. Once an order is on its way it can't be changed.",
  },
  {
    q: "How do I leave a review?",
    a: "You'll need the order code from a purchase that includes the product. Enter it with your review on the product page — reviews are published after a quick moderation check.",
  },
]

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
      <h1 className="font-serif text-4xl text-foreground">Frequently asked</h1>
      <p className="mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
        Everything you need to know about ordering with Eloria.
      </p>

      <Accordion className="mt-10">
        {FAQS.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left font-serif text-lg">{item.q}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
