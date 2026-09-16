"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatMoney } from "@/lib/money"
import { ORDER_STATES, PAYMENT_STATES } from "@/lib/admin/queries"
import { ORDER_STATE_LABELS, PAYMENT_STATE_LABELS, paymentStateClass } from "@/lib/admin/labels"
import { cn } from "@/lib/utils"
import {
  updateOrderState,
  recordPayment,
  setAgreedTotal,
  updateOrderNotes,
  createReturn,
} from "@/app/admin/actions"

type OrderManagerProps = {
  order: {
    id: number
    orderCode: string
    orderState: string
    paymentState: string
    subtotalCents: number
    agreedTotalCents: number | null
    depositCents: number
    notes: string
  }
  payments: { id: number; kind: string; amountCents: number; note: string; createdAt: Date | string }[]
}

function poundsToCents(input: string): number | null {
  const n = Number(input)
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n * 100)
}

export function OrderManager({ order, payments }: OrderManagerProps) {
  const [pending, startTransition] = useTransition()

  const [agreed, setAgreed] = useState(
    order.agreedTotalCents != null ? (order.agreedTotalCents / 100).toString() : "",
  )
  const [notes, setNotes] = useState(order.notes)
  const [payKind, setPayKind] = useState<"deposit" | "balance" | "full" | "refund">("deposit")
  const [payAmount, setPayAmount] = useState("")
  const [payNote, setPayNote] = useState("")

  const [retType, setRetType] = useState<"cancellation" | "return">("cancellation")
  const [retOutcome, setRetOutcome] = useState("")
  const [retNote, setRetNote] = useState("")
  const [retReceived, setRetReceived] = useState(false)

  const paid = payments.filter((p) => p.kind !== "refund").reduce((s, p) => s + p.amountCents, 0)
  const refunded = payments.filter((p) => p.kind === "refund").reduce((s, p) => s + p.amountCents, 0)
  const target = order.agreedTotalCents ?? order.subtotalCents
  const outstanding = Math.max(0, target - (paid - refunded))

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const res = await fn()
      if (res.ok) toast.success(success)
      else toast.error(res.error ?? "Something went wrong.")
    })
  }

  return (
    <div className="space-y-6">
      {/* Fulfilment status */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-medium text-foreground">Fulfilment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Marking an order delivered deducts stock; reversing it restores stock.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ORDER_STATES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending || s === order.orderState}
              onClick={() => run(() => updateOrderState(order.id, s), `Order marked ${ORDER_STATE_LABELS[s]}.`)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:cursor-not-allowed",
                s === order.orderState
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40 disabled:opacity-50",
              )}
            >
              {ORDER_STATE_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      {/* Payments */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-foreground">Payments</h2>
          <span className={cn("rounded-full px-2.5 py-1 text-xs", paymentStateClass(order.paymentState))}>
            {PAYMENT_STATE_LABELS[order.paymentState]}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-secondary/50 p-3">
            <dt className="text-muted-foreground">Target total</dt>
            <dd className="mt-1 text-foreground">{formatMoney(target)}</dd>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <dt className="text-muted-foreground">Collected</dt>
            <dd className="mt-1 text-foreground">{formatMoney(paid - refunded)}</dd>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <dt className="text-muted-foreground">Outstanding</dt>
            <dd className="mt-1 text-foreground">{formatMoney(outstanding)}</dd>
          </div>
        </dl>

        {payments.length > 0 && (
          <ul className="mt-4 divide-y divide-border/60 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span className="capitalize text-muted-foreground">
                  {p.kind}
                  {p.note ? ` · ${p.note}` : ""}
                </span>
                <span className={p.kind === "refund" ? "text-destructive" : "text-foreground"}>
                  {p.kind === "refund" ? "−" : ""}
                  {formatMoney(p.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-3 border-t border-border/60 pt-4 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="pay-kind">Type</Label>
            <select
              id="pay-kind"
              value={payKind}
              onChange={(e) => setPayKind(e.target.value as typeof payKind)}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm text-foreground"
            >
              <option value="deposit">Deposit</option>
              <option value="balance">Balance</option>
              <option value="full">Full</option>
              <option value="refund">Refund</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount (£)</Label>
            <Input
              id="pay-amount"
              inputMode="decimal"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pay-note">Note</Label>
            <Input id="pay-note" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="Optional" />
          </div>
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              const cents = poundsToCents(payAmount)
              if (cents == null) {
                toast.error("Enter a valid amount.")
                return
              }
              run(
                () => recordPayment({ orderId: order.id, kind: payKind, amountCents: cents, note: payNote }),
                "Payment recorded.",
              )
              setPayAmount("")
              setPayNote("")
            }}
            className="rounded-full"
          >
            Record
          </Button>
        </div>
      </section>

      {/* Agreed total + notes */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium text-foreground">Agreed total</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the final total (incl. delivery) agreed on WhatsApp. Subtotal is {formatMoney(order.subtotalCents)}.
          </p>
          <div className="mt-4 flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="agreed">Total (£)</Label>
              <Input
                id="agreed"
                inputMode="decimal"
                value={agreed}
                onChange={(e) => setAgreed(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                const trimmed = agreed.trim()
                const cents = trimmed === "" ? null : poundsToCents(trimmed)
                if (trimmed !== "" && cents == null) {
                  toast.error("Enter a valid total.")
                  return
                }
                run(() => setAgreedTotal(order.id, cents), "Agreed total updated.")
              }}
              className="rounded-full bg-transparent"
            >
              Save
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium text-foreground">Internal notes</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-4"
            placeholder="Delivery arrangements, customer preferences…"
          />
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => run(() => updateOrderNotes(order.id, notes), "Notes saved.")}
            className="mt-3 rounded-full bg-transparent"
          >
            Save notes
          </Button>
        </div>
      </section>

      {/* Returns / cancellations */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-medium text-foreground">Log a cancellation or return</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="ret-type">Type</Label>
            <select
              id="ret-type"
              value={retType}
              onChange={(e) => setRetType(e.target.value as typeof retType)}
              className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
            >
              <option value="cancellation">Cancellation</option>
              <option value="return">Return</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ret-outcome">Outcome</Label>
            <Input
              id="ret-outcome"
              value={retOutcome}
              onChange={(e) => setRetOutcome(e.target.value)}
              placeholder="Refunded, replaced, deposit kept…"
            />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <Label htmlFor="ret-note">Note</Label>
          <Textarea id="ret-note" value={retNote} onChange={(e) => setRetNote(e.target.value)} rows={2} />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={retReceived}
            onChange={(e) => setRetReceived(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Items received back
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            run(
              () =>
                createReturn({
                  orderId: order.id,
                  type: retType,
                  outcome: retOutcome,
                  note: retNote,
                  receivedBack: retReceived,
                }),
              "Logged.",
            )
          }
          className="mt-4 rounded-full bg-transparent"
        >
          Log {retType}
        </Button>
      </section>
    </div>
  )
}
