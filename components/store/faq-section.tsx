import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQS } from "@/lib/store/faq-data"

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-20">
      <div>
        <h2 className="font-serif text-4xl text-foreground">Frequently asked</h2>
        <p className="mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          Everything you need to know about ordering with Eloria.
        </p>
      </div>

      <Accordion className="mt-10">
        {FAQS.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-left font-serif text-lg">{item.q}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
