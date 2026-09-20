"use client"

import { useState, useTransition } from "react"
import { Pencil, Plus, Trash2, X, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createCategory, deleteCategory, updateCategory } from "@/app/admin/actions"

type Category = { id: number; name: string; slug: string }

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [pending, startTransition] = useTransition()

  function addCategory() {
    startTransition(async () => {
      const result = await createCategory(newName)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setCategories((current) => [...current, result.category].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName("")
      toast.success("Category created.")
    })
  }

  function saveCategory(id: number) {
    startTransition(async () => {
      const result = await updateCategory(id, editingName)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setCategories((current) =>
        current.map((category) => (category.id === id ? result.category : category)).sort((a, b) => a.name.localeCompare(b.name)),
      )
      setEditingId(null)
      toast.success("Category updated.")
    })
  }

  function removeCategory(category: Category) {
    if (!window.confirm(`Delete “${category.name}”? Products in this category will become uncategorised.`)) return
    startTransition(async () => {
      const result = await deleteCategory(category.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setCategories((current) => current.filter((item) => item.id !== category.id))
      toast.success("Category deleted.")
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="font-medium text-foreground">Categories</h2>
          <p className="mt-1 text-sm text-muted-foreground">These categories appear in the shop filters and product forms.</p>
        </div>
        {categories.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-muted-foreground">No categories yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Create one to organise products in your shop.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/70">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 px-5 py-4">
                {editingId === category.id ? (
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveCategory(category.id)
                      if (event.key === "Escape") setEditingId(null)
                    }}
                    autoFocus
                    className="max-w-sm"
                    aria-label={`Edit ${category.name}`}
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">/{category.slug}</p>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-1">
                  {editingId === category.id ? (
                    <>
                      <Button type="button" size="icon" variant="ghost" onClick={() => saveCategory(category.id)} disabled={pending} aria-label="Save category">
                        <Check data-icon="inline-start" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancel editing">
                        <X data-icon="inline-start" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => { setEditingId(category.id); setEditingName(category.name) }}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil data-icon="inline-start" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => removeCategory(category)} disabled={pending} aria-label={`Delete ${category.name}`}>
                        <Trash2 data-icon="inline-start" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="h-fit rounded-xl border border-border bg-card p-5">
        <h2 className="font-medium text-foreground">Add category</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use a clear name customers will recognise.</p>
        <div className="mt-4 flex flex-col gap-3">
          <Input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") addCategory() }}
            placeholder="e.g. Body care"
            aria-label="New category name"
          />
          <Button type="button" onClick={addCategory} disabled={pending || !newName.trim()} className="rounded-full">
            <Plus data-icon="inline-start" />
            Add category
          </Button>
        </div>
      </section>
    </div>
  )
}
