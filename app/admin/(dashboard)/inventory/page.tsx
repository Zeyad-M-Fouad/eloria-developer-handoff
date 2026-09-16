import { getAllCombinationsWithProduct } from "@/lib/admin/queries"
import { InventoryRow } from "@/components/admin/inventory-row"

export const metadata = { title: "Inventory" }

export default async function InventoryPage() {
  const rows = await getAllCombinationsWithProduct()
  const lowCount = rows.filter((r) => r.combo.availableQty <= r.combo.lowStockThreshold).length

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
        <div className="rounded-xl border border-border bg-card">
          {rows.map(({ combo, product }) => (
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
        </div>
      )}
    </div>
  )
}
