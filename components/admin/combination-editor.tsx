"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Trash2, Plus, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatMoney } from "@/lib/money"
import { upsertCombination, deleteCombination } from "@/app/admin/actions"

type Combination = {
  id: number
  size: string | null
  color: string | null
  scent: string | null
  priceCents: number
  salePriceCents: number | null
  availableQty: number
  lowStockThreshold: number
}

function poundsToCents(input: string): number | null {
  const n = Number(input)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

type Draft = {
  size: string
  color: string
  scent: string
  price: string
  salePrice: string
  qty: string
  threshold: string
}

function toDraft(c: Combination): Draft {
  return {
    size: c.size ?? "",
    color: c.color ?? "",
    scent: c.scent ?? "",
    price: (c.priceCents / 100).toString(),
    salePrice: c.salePriceCents != null ? (c.salePriceCents / 100).toString() : "",
    qty: String(c.availableQty),
    threshold: String(c.lowStockThreshold),
  }
}

const EMPTY: Draft = { size: "", color: "", scent: "", price: "", salePrice: "", qty: "0", threshold: "5" }

export function CombinationEditor({
  productId,
  combinations,
}: {
  productId: number
  combinations: Combination[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [adding, setAdding] = useState(false)

  function beginEdit(c: Combination) {
    setEditingId(c.id)
    setAdding(false)
    setDraft(toDraft(c))
  }

  function beginAdd() {
    setAdding(true)
    setEditingId(null)
    setDraft(EMPTY)
  }

  function cancel() {
    setEditingId(null)
    setAdding(false)
    setDraft(EMPTY)
  }

  function save(id?: number) {
    const priceCents = poundsToCents(draft.price)
    if (priceCents == null || priceCents === 0) return toast.error("Enter a valid price.")
    const saleCents = draft.salePrice.trim() === "" ? null : poundsToCents(draft.salePrice)
    if (saleCents != null && saleCents >= priceCents) return toast.error("Sale price must be below regular price.")

    startTransition(async () => {
      const res = await upsertCombination({
        id,
        productId,
        size: draft.size.trim() || null,
        color: draft.color.trim() || null,
        scent: draft.scent.trim() || null,
        priceCents,
        salePriceCents: saleCents,
        availableQty: Math.max(0, Math.trunc(Number(draft.qty) || 0)),
        lowStockThreshold: Math.max(0, Math.trunc(Number(draft.threshold) || 5)),
      })
      if (res.ok) {
        toast.success(id ? "Variant updated." : "Variant added.")
        cancel()
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteCombination(id, productId)
      toast.success("Variant removed.")
      router.refresh()
    })
  }

  const fields = (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["size", "color", "scent"] as const).map((field) => {
          const labels = { size: "Size", color: "Colour", scent: "Scent" }
          return (
            <div key={field} className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={`variant-${field}`} className="text-xs font-medium text-foreground">{labels[field]}</label>
              <Input id={`variant-${field}`} value={draft[field]} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} />
            </div>
          )
        })}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {([
          ["price", "Price (£)", "decimal"],
          ["salePrice", "Sale price (£)", "decimal"],
          ["qty", "Stock quantity", "numeric"],
          ["threshold", "Low-stock threshold", "numeric"],
        ] as const).map(([field, label, inputMode]) => (
          <div key={field} className="flex min-w-0 flex-col gap-1.5">
            <label htmlFor={`variant-${field}`} className="text-xs font-medium text-foreground">{label}</label>
            <Input id={`variant-${field}`} inputMode={inputMode} value={draft[field]} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} />
          </div>
        ))}
      </div>
    </>
  )

  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-foreground">Variants &amp; pricing</h2>
        {!adding && (
          <Button type="button" variant="outline" onClick={beginAdd} className="rounded-full bg-transparent">
            <Plus width={15} height={15} />
            Add variant
          </Button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {combinations.map((c) => {
          const opts = [c.size, c.color, c.scent].filter(Boolean).join(" / ") || "Default"
          const onSale = c.salePriceCents != null && c.salePriceCents < c.priceCents
          if (editingId === c.id) {
            return (
              <div key={c.id} className="rounded-lg border border-primary/40 p-3">
                {fields}
                <div className="mt-3 flex gap-2">
                  <Button type="button" disabled={pending} onClick={() => save(c.id)} className="rounded-full">
                    Save
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancel} className="rounded-full">
                    Cancel
                  </Button>
                </div>
              </div>
            )
          }
          return (
            <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">{opts}</p>
                <p className="text-xs text-muted-foreground">
                  {onSale ? (
                    <>
                      <span className="text-accent">{formatMoney(c.salePriceCents as number)}</span>{" "}
                      <span className="line-through">{formatMoney(c.priceCents)}</span>
                    </>
                  ) : (
                    formatMoney(c.priceCents)
                  )}{" "}
                  · {c.availableQty} in stock · low at {c.lowStockThreshold}
                </p>
              </div>
              <button
                type="button"
                onClick={() => beginEdit(c)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Edit variant"
              >
                <Pencil width={15} height={15} />
              </button>
              {combinations.length > 1 && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => remove(c.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                  aria-label="Delete variant"
                >
                  <Trash2 width={15} height={15} />
                </button>
              )}
            </div>
          )
        })}

        {adding && (
          <div className="rounded-lg border border-primary/40 p-3">
            {fields}
            <div className="mt-3 flex gap-2">
              <Button type="button" disabled={pending} onClick={() => save()} className="rounded-full">
                Add variant
              </Button>
              <Button type="button" variant="ghost" onClick={cancel} className="rounded-full">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
