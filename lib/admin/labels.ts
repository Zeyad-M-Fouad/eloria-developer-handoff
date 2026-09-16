export const ORDER_STATE_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const PAYMENT_STATE_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  deposit_paid: "Deposit paid",
  paid_in_full: "Paid in full",
  refunded: "Refunded",
}

// Tailwind classes for status pills, using theme tokens only.
export function orderStateClass(state: string): string {
  switch (state) {
    case "delivered":
      return "bg-primary/12 text-primary"
    case "cancelled":
      return "bg-destructive/12 text-destructive"
    case "pending":
      return "bg-accent/15 text-accent"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export function paymentStateClass(state: string): string {
  switch (state) {
    case "paid_in_full":
      return "bg-primary/12 text-primary"
    case "refunded":
      return "bg-destructive/12 text-destructive"
    case "deposit_paid":
      return "bg-accent/15 text-accent"
    default:
      return "bg-muted text-muted-foreground"
  }
}
