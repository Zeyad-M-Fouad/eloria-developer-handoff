export function formatMoney(cents: number): string {
  const value = (cents ?? 0) / 100
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value)
}

/** Effective price for a combination, respecting an active sale price. */
export function effectivePriceCents(priceCents: number, salePriceCents: number | null): number {
  if (salePriceCents != null && salePriceCents < priceCents) return salePriceCents
  return priceCents
}

export function isOnSale(priceCents: number, salePriceCents: number | null): boolean {
  return salePriceCents != null && salePriceCents < priceCents
}

export function discountPercent(priceCents: number, salePriceCents: number | null): number {
  if (!isOnSale(priceCents, salePriceCents)) return 0
  return Math.round(((priceCents - (salePriceCents as number)) / priceCents) * 100)
}
