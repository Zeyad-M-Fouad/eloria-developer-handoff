import Link from "next/link"
import Image from "next/image"
import { MessageCircle, Leaf, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/store/product-card"
import { FaqSection } from "@/components/store/faq-section"
import { ContactForm } from "@/components/store/contact-form"
import { StarRating } from "@/components/store/star-rating"
import { getFeaturedProducts, getHomepageReviews } from "@/lib/store/queries"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [products, homepageReviews] = await Promise.all([getFeaturedProducts(), getHomepageReviews()])
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

      {/* Customer reviews */}
      <section className="border-y border-border/70 bg-secondary/20 px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Kind words</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground">Loved by thoughtful skin</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A few notes from the Eloria community.
            </p>
          </div>

          {homepageReviews.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {homepageReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-border/70 bg-background p-6">
                  <StarRating value={review.rating} />
                  <blockquote className="mt-4 text-pretty leading-relaxed text-foreground">
                    &ldquo;{review.body}&rdquo;
                  </blockquote>
                  <div className="mt-6 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                    <span>{review.authorName}</span>
                    <span>{review.productName}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mx-auto mt-10 max-w-md text-center text-sm text-muted-foreground">
              Be the first to share your Eloria experience.
            </p>
          )}
        </div>
      </section>

      <FaqSection />

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Get in touch</p>
          <h2 className="mt-3 font-serif text-3xl text-foreground">We&apos;re here to help</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Have a question about a product or your order? Send us a message and we&apos;ll get back to you shortly.
          </p>
        </div>
        <div className="mx-auto max-w-3xl">
          <ContactForm />
        </div>
      </section>
    </div>
  )
}
