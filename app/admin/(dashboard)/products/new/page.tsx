import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getCategoriesList } from "@/lib/admin/queries"
import { NewProductForm } from "@/components/admin/new-product-form"

export const metadata = { title: "New product" }
export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const categories = await getCategoriesList()

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/products"
        className="mb-5 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft width={16} height={16} />
        All products
      </Link>
      <h1 className="mb-6 font-serif text-3xl text-foreground">New product</h1>
      <NewProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  )
}
