import Link from "next/link"
import Image from "next/image"
import { MessageCircle, Leaf, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/store/product-card"
import { FaqSection } from "@/components/store/faq-section"
import { getActiveProducts } from "@/lib/store/queries"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const products = await getActiveProducts()
  const featured = products.slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Small-batch skincare</p>
            <h1 className="mt-4 text-balance font-serif text-4xl leading-[1.05] text-foreground md:text-6xl">
              Considered skincare, made personal
            </h1>
            <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Botanical body care crafted in small batches. Choose your size and scent, then confirm your order with us
              directly over WhatsApp — no rushed checkout, just care.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button render={<Link href="/products" />} size="lg" className="rounded-full">
                Shop the collection
              </Button>
              <Button
                render={<Link href="/#faq" />}
                size="lg"
                variant="outline"
                className="rounded-full bg-transparent"
              >
                How ordering works
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary/50 md:aspect-square">
            <Image
              src="/hero-eloria.png"
              alt="Eloria botanical skincare arranged on a soft neutral surface"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-border/70 bg-secondary/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 md:px-6">
          {[
            { icon: Leaf, title: "Botanical formulas", body: "Cold-pressed oils and gentle actives, in recyclable packaging." },
            { icon: MessageCircle, title: "Confirmed personally", body: "We agree your final total and delivery over WhatsApp." },
            { icon: HandHeart, title: "Small deposit", body: "A light deposit secures your batch — the rest on delivery." },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <f.icon width={20} height={20} />
              </span>
              <h2 className="font-serif text-lg text-foreground">{f.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-foreground">The collection</h2>
            <p className="mt-2 text-sm text-muted-foreground">A tightly edited range, made to be used every day.</p>
          </div>
          <Link href="/products" className="shrink-0 text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted-foreground">Products are coming soon.</p>
        )}
      </section>

      <FaqSection />
    </div>
  )
}
