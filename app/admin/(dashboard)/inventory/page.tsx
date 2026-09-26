import { getAllCombinationsWithProduct } from "@/backend/admin"
import { InventoryRow } from "@/components/admin/inventory-row"

export const metadata = { title: "Inventory" }
export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  const rows = await getAllCombinationsWithProduct()
  const lowCount = rows.filter((r) => r.combo.availableQty <= r.combo.lowStockThreshold).length
  const groups = rows.reduce<Map<string, typeof rows>>((map, row) => {
    const group = map.get(row.categoryName) ?? []
    group.push(row)
    map.set(row.categoryName, group)
    return map
  }, new Map())

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="font-serif text-3xl text-foreground">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} variants · {lowCount} low on stock. Delivered orders deduct stock automatically.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-5 py-16 text-center text-muted-foreground">
          No variants yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {[...groups.entries()].map(([categoryName, categoryRows]) => (
            <section key={categoryName} className="overflow-hidden rounded-xl border border-border bg-card">
              <header className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                <div>
                  <h2 className="font-serif text-xl text-foreground">{categoryName}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {categoryRows.length} {categoryRows.length === 1 ? "variant" : "variants"}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {categoryRows.filter((row) => row.combo.availableQty <= row.combo.lowStockThreshold).length} low stock
                </span>
              </header>
              {categoryRows.map(({ combo, product }) => (
                <InventoryRow
                  key={combo.id}
                  productName={product?.name ?? "Product"}
                  combo={{
                    id: combo.id,
                    size: combo.size,
                    color: combo.color,
                    scent: combo.scent,
                    availableQty: combo.availableQty,
                    onTheWayQty: combo.onTheWayQty,
                    deliveredQty: combo.deliveredQty,
                    lowStockThreshold: combo.lowStockThreshold,
                  }}
                />
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
