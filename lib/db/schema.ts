import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  serial,
  jsonb,
} from "drizzle-orm/pg-core"

/* ----------------------------- Better Auth ----------------------------- */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

/* ------------------------------- Catalog ------------------------------- */

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  itemCode: text("itemCode").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  categoryId: integer("categoryId"),
  images: jsonb("images").notNull().default([]).$type<string[]>(),
  ingredients: text("ingredients").notNull().default(""),
  usageInstructions: text("usageInstructions").notNull().default(""),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const productCombinations = pgTable("product_combinations", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  sku: text("sku"),
  size: text("size"),
  color: text("color"),
  scent: text("scent"),
  priceCents: integer("priceCents").notNull(),
  salePriceCents: integer("salePriceCents"),
  availableQty: integer("availableQty").notNull().default(0),
  onTheWayQty: integer("onTheWayQty").notNull().default(0),
  deliveredQty: integer("deliveredQty").notNull().default(0),
  lowStockThreshold: integer("lowStockThreshold").notNull().default(5),
  lowStockAlerted: boolean("lowStockAlerted").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

/* ------------------------------- Orders -------------------------------- */

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: text("orderCode").notNull().unique(),
  customerEmail: text("customerEmail").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  orderState: text("orderState").notNull().default("pending"),
  paymentState: text("paymentState").notNull().default("unpaid"),
  subtotalCents: integer("subtotalCents").notNull().default(0),
  discountCents: integer("discountCents").notNull().default(0),
  agreedTotalCents: integer("agreedTotalCents"),
  depositCents: integer("depositCents").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const orderLines = pgTable("order_lines", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId"),
  combinationId: integer("combinationId"),
  productName: text("productName").notNull(),
  itemCode: text("itemCode"),
  size: text("size"),
  color: text("color"),
  scent: text("scent"),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unitPriceCents").notNull(),
  discountCents: integer("discountCents").notNull().default(0),
})

export const paymentRecords = pgTable("payment_records", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  kind: text("kind").notNull(),
  amountCents: integer("amountCents").notNull().default(0),
  note: text("note").notNull().default(""),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  combinationId: integer("combinationId").notNull(),
  orderId: integer("orderId"),
  quantityChange: integer("quantityChange").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export const cancellationsReturns = pgTable("cancellations_returns", {
  id: serial("id").primaryKey(),
  refCode: text("refCode").notNull(),
  orderId: integer("orderId").notNull(),
  type: text("type").notNull(),
  outcome: text("outcome").notNull().default(""),
  affectedItems: jsonb("affectedItems").notNull().default([]),
  note: text("note").notNull().default(""),
  receivedBack: boolean("receivedBack").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

/* ------------------------------- Reviews ------------------------------- */

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  orderCode: text("orderCode").notNull(),
  authorName: text("authorName").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull().default(""),
  status: text("status").notNull().default("pending"),
  featuredOnHome: boolean("featuredOnHome").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

/* ---------------------------- Notifications ---------------------------- */

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  event: text("event").notNull(),
  relatedId: integer("relatedId"),
  message: text("message").notNull().default(""),
  channel: text("channel").notNull().default("dashboard"),
  isRead: boolean("isRead").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})
