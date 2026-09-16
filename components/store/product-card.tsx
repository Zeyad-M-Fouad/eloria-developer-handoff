import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/money"
import type { StoreProduct } from "@/lib/store/queries"

export function ProductCard({ product }: { product: StoreProduct }) {
  const priceLabel =
    product.minPriceCents === product.maxPriceCents
      ? formatMoney(product.minPriceCents)
      : `From ${formatMoney(product.minPriceCents)}`

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary/50">
        {product.images[0] ? (
          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.hasSale && !product.soldOut && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">On sale</Badge>
          )}
          {product.soldOut && (
            <Badge variant="secondary" className="bg-foreground/80 text-background">
              Sold out
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        {product.categoryName && (
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.categoryName}</p>
        )}
        <h3 className="mt-1 text-pretty font-serif text-lg leading-snug text-foreground">{product.name}</h3>
        <p className="mt-auto pt-2 text-sm text-muted-foreground">{priceLabel}</p>
      </div>
    </Link>
  )
}
