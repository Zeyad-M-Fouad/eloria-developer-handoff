import { db } from "@/lib/db"
import { products, productCombinations, categories, reviews } from "@/lib/db/schema"
import { and, eq, inArray, desc } from "drizzle-orm"
import { effectivePriceCents, isOnSale } from "@/lib/money"

export type Combination = typeof productCombinations.$inferSelect
export type Category = typeof categories.$inferSelect

export type StoreProduct = {
  id: number
  itemCode: string
  name: string
  slug: string
  description: string
  categoryId: number | null
  categoryName: string | null
  images: string[]
  ingredients: string
  usageInstructions: string
  combinations: Combination[]
  minPriceCents: number
  maxPriceCents: number
  hasSale: boolean
  soldOut: boolean
}

function assembleProduct(
  p: typeof products.$inferSelect,
  combos: Combination[],
  categoryName: string | null,
): StoreProduct {
  const effectives = combos.map((c) => effectivePriceCents(c.priceCents, c.salePriceCents))
  const minPriceCents = effectives.length ? Math.min(...effectives) : 0
  const maxPriceCents = effectives.length ? Math.max(...effectives) : 0
  const hasSale = combos.some((c) => isOnSale(c.priceCents, c.salePriceCents))
  const soldOut = combos.length > 0 && combos.every((c) => c.availableQty <= 0)
  return {
    id: p.id,
    itemCode: p.itemCode,
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryId: p.categoryId,
    categoryName,
    images: (p.images as string[]) ?? [],
    ingredients: p.ingredients,
    usageInstructions: p.usageInstructions,
    combinations: combos,
    minPriceCents,
    maxPriceCents,
    hasSale,
    soldOut,
  }
}

export async function getCategories(): Promise<Category[]> {
  return db.select().from(categories).orderBy(categories.name)
}

export async function getActiveProducts(): Promise<StoreProduct[]> {
  const rows = await db.select().from(products).where(eq(products.isActive, true)).orderBy(products.id)
  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)
  const combos = await db.select().from(productCombinations).where(inArray(productCombinations.productId, ids))
  const cats = await db.select().from(categories)
  const catMap = new Map(cats.map((c) => [c.id, c.name]))

  return rows.map((p) =>
    assembleProduct(
      p,
      combos.filter((c) => c.productId === p.id),
      p.categoryId != null ? (catMap.get(p.categoryId) ?? null) : null,
    ),
  )
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  const [p] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.isActive, true)))
    .limit(1)
  if (!p) return null

  const combos = await db.select().from(productCombinations).where(eq(productCombinations.productId, p.id))
  let categoryName: string | null = null
  if (p.categoryId != null) {
    const [c] = await db.select().from(categories).where(eq(categories.id, p.categoryId)).limit(1)
    categoryName = c?.name ?? null
  }
  return assembleProduct(p, combos, categoryName)
}

export type PublishedReviews = {
  average: number
  count: number
  items: (typeof reviews.$inferSelect)[]
}

export async function getPublishedReviews(productId: number): Promise<PublishedReviews> {
  const items = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.productId, productId), eq(reviews.status, "published")))
    .orderBy(desc(reviews.createdAt))
  const count = items.length
  const average = count ? items.reduce((s, r) => s + r.rating, 0) / count : 0
  return { average, count, items }
}
