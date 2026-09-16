"use client"

import { useState, useTransition } from "react"
import { Plus, Minus, TruckIcon } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { adjustStock, receiveOnTheWay } from "@/app/admin/actions"

type Row = {
  id: number
  size: string | null
  color: string | null
  scent: string | null
  availableQty: number
  onTheWayQty: number
  deliveredQty: number
  lowStockThreshold: number
}

export function InventoryRow({ productName, combo }: { productName: string; combo: Row }) {
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState("1")
  const opts = [combo.size, combo.color, combo.scent].filter(Boolean).join(" / ")
  const low = combo.availableQty <= combo.lowStockThreshold

  function change(sign: 1 | -1) {
    const n = Math.trunc(Number(amount))
    if (!Number.isFinite(n) || n <= 0) return toast.error("Enter a positive whole number.")
    startTransition(async () => {
      const res = await adjustStock(combo.id, sign * n, sign > 0 ? "restock" : "adjustment")
      if (res.ok) toast.success("Stock updated.")
      else toast.error(res.error ?? "Failed.")
    })
  }

  function receive() {
    startTransition(async () => {
      const res = await receiveOnTheWay(combo.id, combo.onTheWayQty)
      if (res.ok) toast.success("Shipment received into stock.")
      else toast.error(res.error ?? "Nothing to receive.")
    })
  }

  return (
    <div className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 last:border-0 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          {productName}
          {opts ? <span className="text-muted-foreground"> · {opts}</span> : null}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className={cn(low && "text-accent")}>Available {combo.availableQty}</span>
          <span>On the way {combo.onTheWayQty}</span>
          <span>Delivered {combo.deliveredQty}</span>
          <span>Low at {combo.lowStockThreshold}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          className="h-9 w-16"
          aria-label="Adjust amount"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => change(1)}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm text-foreground hover:border-primary/40 disabled:opacity-50"
        >
          <Plus width={14} height={14} />
          Add
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => change(-1)}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-border px-3 text-sm text-foreground hover:border-primary/40 disabled:opacity-50"
        >
          <Minus width={14} height={14} />
          Remove
        </button>
        {combo.onTheWayQty > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={receive}
            className="inline-flex h-9 items-center gap-1 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <TruckIcon width={14} height={14} />
            Receive {combo.onTheWayQty}
          </button>
        )}
      </div>
    </div>
  )
}
