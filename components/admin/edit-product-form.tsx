"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProduct, toggleProductActive } from "@/app/admin/actions"

type Product = {
  id: number
  name: string
  itemCode: string
  description: string
  categoryId: number | null
  images: string[]
  ingredients: string
  usageInstructions: string
  isActive: boolean
}

export function EditProductForm({
  product,
  categories,
}: {
  product: Product
  categories: { id: number; name: string }[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState(product.name)
  const [itemCode, setItemCode] = useState(product.itemCode)
  const [categoryId, setCategoryId] = useState(product.categoryId ? String(product.categoryId) : "")
  const [description, setDescription] = useState(product.description)
  const [ingredients, setIngredients] = useState(product.ingredients)
  const [usage, setUsage] = useState(product.usageInstructions)
  const [images, setImages] = useState((product.images ?? []).join("\n"))
  const [isActive, setIsActive] = useState(product.isActive)

  function save() {
    if (!name.trim()) return toast.error("Enter a product name.")
    if (!itemCode.trim()) return toast.error("Enter an item code.")
    const imageList = images
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean)

    startTransition(async () => {
      const res = await updateProduct({
        id: product.id,
        name,
        itemCode,
        description,
        categoryId: categoryId ? Number(categoryId) : null,
        images: imageList,
        ingredients,
        usageInstructions: usage,
        isActive,
      })
      if (res.ok) {
        toast.success("Product saved.")
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  function toggle(next: boolean) {
    setIsActive(next)
    startTransition(async () => {
      await toggleProductActive(product.id, next)
      router.refresh()
    })
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-foreground">Details</h2>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => toggle(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Visible in store
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="code">Item code</Label>
          <Input id="code" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
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
        <Textarea id="img" value={images} onChange={(e) => setImages(e.target.value)} rows={2} />
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="button" disabled={pending} onClick={save} className="rounded-full">
          {pending ? "Saving…" : "Save details"}
        </Button>
      </div>
    </section>
  )
}
