"use client"

import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { submitReview } from "@/app/actions/reviews"

export function ReviewForm({ productId }: { productId: number }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState("")
  const [orderCode, setOrderCode] = useState("")
  const [body, setBody] = useState("")
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1) {
      toast.error("Please choose a star rating.")
      return
    }
    startTransition(async () => {
      const res = await submitReview({ productId, orderCode, authorName: name, rating, body })
      if (res.ok) {
        setDone(true)
        toast.success("Thank you! Your review is awaiting moderation.")
      } else {
        toast.error(res.error)
      }
    })
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
        Thank you for your review. It will appear once it&apos;s been approved.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <Label className="mb-2 block">Your rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                width={26}
                height={26}
                className={cn(
                  "transition-colors",
                  (hover || rating) >= i ? "fill-accent text-accent" : "fill-transparent text-border",
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="review-name">Name</Label>
          <Input id="review-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="review-code">Order code</Label>
          <Input
            id="review-code"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="ELR-XXXXXX"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="review-body">Your review</Label>
        <Textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Tell others how you found it…"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Reviews are verified against your order code and published after a quick moderation check.
      </p>

      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  )
}
