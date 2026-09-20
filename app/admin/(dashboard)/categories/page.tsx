import { CategoryManager } from "@/components/admin/category-manager"
import { getCategoriesList } from "@/lib/admin/queries"

export const metadata = { title: "Categories" }
export const dynamic = "force-dynamic"

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesList()

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="text-sm text-muted-foreground">Catalog organisation</p>
        <h1 className="font-serif text-3xl text-foreground">Categories</h1>
      </header>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}
