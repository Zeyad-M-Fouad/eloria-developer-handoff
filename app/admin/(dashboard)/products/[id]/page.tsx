import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ExternalLink } from "lucide-react"
import { getAdminProduct, getCategoriesList } from "@/lib/admin/queries"
import { EditProductForm } from "@/components/admin/edit-product-form"
import { CombinationEditor } from "@/components/admin/combination-editor"

export const metadata = { title: "Edit product" }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId)) notFound()

  const [data, categories] = await Promise.all([getAdminProduct(numericId), getCategoriesList()])
  if (!data) notFound()
  const { product, combinations } = data

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft width={16} height={16} />
        All products
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-foreground">{product.name}</h1>
        {product.isActive && (
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            View in store
            <ExternalLink width={14} height={14} />
          </Link>
        )}
      </div>

      <div className="space-y-6">
        <EditProductForm
          product={{
            id: product.id,
            name: product.name,
            itemCode: product.itemCode,
            description: product.description,
            categoryId: product.categoryId,
            images: (product.images as string[]) ?? [],
            ingredients: product.ingredients,
            usageInstructions: product.usageInstructions,
            isActive: product.isActive,
          }}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        />
        <CombinationEditor productId={product.id} combinations={combinations} />
      </div>
    </div>
  )
}
