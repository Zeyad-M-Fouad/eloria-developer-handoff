"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"

export type CartItem = {
  combinationId: number
  productId: number
  slug: string
  productName: string
  itemCode: string | null
  image: string | null
  size: string | null
  color: string | null
  scent: string | null
  unitPriceCents: number
  listPriceCents: number
  maxQty: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotalCents: number
  discountCents: number
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void
  updateQuantity: (combinationId: number, quantity: number) => void
  removeItem: (combinationId: number) => void
  clear: () => void
  hydrated: boolean
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "eloria-cart-v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.combinationId === item.combinationId)
      if (existing) {
        const next = Math.min(existing.quantity + quantity, Math.max(1, item.maxQty))
        return prev.map((i) => (i.combinationId === item.combinationId ? { ...i, ...item, quantity: next } : i))
      }
      return [...prev, { ...item, quantity: Math.min(quantity, Math.max(1, item.maxQty)) }]
    })
  }, [])

  const updateQuantity = useCallback((combinationId: number, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.combinationId === combinationId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, Math.max(1, i.maxQty))) }
            : i,
        )
        .filter((i) => i.quantity > 0),
    )
  }, [])

  const removeItem = useCallback((combinationId: number) => {
    setItems((prev) => prev.filter((i) => i.combinationId !== combinationId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const { count, subtotalCents, discountCents } = useMemo(() => {
    let count = 0
    let subtotalCents = 0
    let discountCents = 0
    for (const i of items) {
      count += i.quantity
      subtotalCents += i.unitPriceCents * i.quantity
      discountCents += (i.listPriceCents - i.unitPriceCents) * i.quantity
    }
    return { count, subtotalCents, discountCents }
  }, [items])

  const value: CartContextValue = {
    items,
    count,
    subtotalCents,
    discountCents,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    hydrated,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
