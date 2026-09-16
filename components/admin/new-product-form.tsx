"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProduct } from "@/app/admin/actions"

type ComboRow = {
  key: string
  size: string
  color: string
  scent: string
  price: string
  salePrice: string
  qty: string
  threshold: string
}

function blankRow(): ComboRow {
  return { key: crypto.randomUUID(), size: "", color: "", scent: "", price: "", salePrice: "", qty: "0", threshold: "5" }
}

function poundsToCents(input: string): number | null {
  const n = Number(input)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

export function NewProductForm({ categories }: { categories: { id: number; name: string }[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState("")
  const [itemCode, setItemCode] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [description, setDescription] = useState("")
  const [ingredients, setIngredients] = useState("")
  const [usage, setUsage] = useState("")
  const [images, setImages] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [rows, setRows] = useState<ComboRow[]>([blankRow()])

  function updateRow(key: string, patch: Partial<ComboRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function submit() {
    if (!name.trim()) return toast.error("Enter a product name.")
    if (!itemCode.trim()) return toast.error("Enter an item code.")

    const combinations = []
    for (const r of rows) {
      const priceCents = poundsToCents(r.price)
      if (priceCents == null || priceCents === 0) return toast.error("Every variant needs a valid price.")
      const saleCents = r.salePrice.trim() === "" ? null : poundsToCents(r.salePrice)
      if (saleCents != null && saleCents >= priceCents)
        return toast.error("Sale price must be below the regular price.")
      combinations.push({
        size: r.size.trim() || null,
        color: r.color.trim() || null,
        scent: r.scent.trim() || null,
        priceCents,
        salePriceCents: saleCents,
        availableQty: Math.max(0, Math.trunc(Number(r.qty) || 0)),
        lowStockThreshold: Math.max(0, Math.trunc(Number(r.threshold) || 5)),
      })
    }

    const imageList = images
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)

    startTransition(async () => {
      const res = await createProduct({
        name,
        itemCode,
        description,
        categoryId: categoryId ? Number(categoryId) : null,
        images: imageList,
        ingredients,
        usageInstructions: usage,
        isActive,
        combinations,
      })
      if (res.ok) {
        toast.success("Product created.")
        router.push(`/admin/products/${res.id}`)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-medium text-foreground">Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Item code</Label>
            <Input id="code" value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="ELR-XXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat">Category</Label>
            <select
              id="cat"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Visible in store
          </label>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ing">Ingredients</Label>
            <Textarea id="ing" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="use">How to use</Label>
            <Textarea id="use" value={usage} onChange={(e) => setUsage(e.target.value)} rows={3} />
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="img">Image URLs (one per line)</Label>
          <Textarea
            id="img"
            value={images}
            onChange={(e) => setImages(e.target.value)}
            rows={2}
            placeholder="/products/example.png"
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-foreground">Variants</h2>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((prev) => [...prev, blankRow()])}
            className="rounded-full bg-transparent"
          >
            <Plus width={15} height={15} />
            Add variant
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((r) => (
            <div key={r.key} className="rounded-lg border border-border/70 p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input placeholder="Size" value={r.size} onChange={(e) => updateRow(r.key, { size: e.target.value })} />
                <Input placeholder="Colour" value={r.color} onChange={(e) => updateRow(r.key, { color: e.target.value })} />
                <Input placeholder="Scent" value={r.scent} onChange={(e) => updateRow(r.key, { scent: e.target.value })} />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <Input placeholder="Price £" inputMode="decimal" value={r.price} onChange={(e) => updateRow(r.key, { price: e.target.value })} />
                <Input placeholder="Sale £" inputMode="decimal" value={r.salePrice} onChange={(e) => updateRow(r.key, { salePrice: e.target.value })} />
                <Input placeholder="Qty" inputMode="numeric" value={r.qty} onChange={(e) => updateRow(r.key, { qty: e.target.value })} />
                <div className="flex gap-2">
                  <Input placeholder="Low at" inputMode="numeric" value={r.threshold} onChange={(e) => updateRow(r.key, { threshold: e.target.value })} />
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRows((prev) => prev.filter((x) => x.key !== r.key))}
                      className="shrink-0 rounded-md px-2 text-muted-foreground hover:text-destructive"
                      aria-label="Remove variant"
                    >
                      <Trash2 width={16} height={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <Button type="button" disabled={pending} onClick={submit} className="rounded-full">
          {pending ? "Creating…" : "Create product"}
        </Button>
      </div>
    </div>
  )
}
