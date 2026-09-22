import assert from "node:assert/strict"
import test from "node:test"
import { calculatePaymentMetrics } from "./payment-metrics.ts"

test("calculates gross, refunds, and net collections", () => {
  assert.deepEqual(
    calculatePaymentMetrics([
      { kind: "full", amountCents: 13000 },
      { kind: "refund", amountCents: 7000 },
    ]),
    { grossCollectionsCents: 13000, refundsCents: 7000, netCollectionsCents: 6000 },
  )
})

test("keeps fulfillment independent from payment calculations", () => {
  assert.equal(calculatePaymentMetrics([{ kind: "refund", amountCents: 7000 }]).netCollectionsCents, -7000)
})
