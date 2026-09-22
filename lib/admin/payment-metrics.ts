export type PaymentMetricRecord = {
  kind: string
  amountCents: number
}

export function calculatePaymentMetrics(payments: PaymentMetricRecord[]) {
  const grossCollectionsCents = payments
    .filter((payment) => payment.kind !== "refund")
    .reduce((total, payment) => total + Math.max(0, payment.amountCents), 0)
  const refundsCents = payments
    .filter((payment) => payment.kind === "refund")
    .reduce((total, payment) => total + Math.max(0, payment.amountCents), 0)

  return {
    grossCollectionsCents,
    refundsCents,
    netCollectionsCents: grossCollectionsCents - refundsCents,
  }
}
