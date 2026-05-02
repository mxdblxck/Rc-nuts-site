import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()), // "admin" | "customer"
  }).index("by_token", ["tokenIdentifier"]),

  products: defineTable({
    nameAr: v.string(),
    descriptionAr: v.string(),
    benefitsAr: v.optional(v.array(v.string())),
    category: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.string())),
    galleryStorageIds: v.optional(v.array(v.id("_storage"))),
    inStock: v.boolean(),
    stockQuantity: v.optional(v.number()),
    weight: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    slug: v.string(),
    hasTasteOptions: v.optional(v.boolean()),
    tasteOptions: v.optional(v.array(v.string())),
    packagingOptions: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          originalPrice: v.optional(v.number()),
        })
      )
    ),
  })
    .index("by_category", ["category"])
    .index("by_featured", ["featured"])
    .index("by_slug", ["slug"]),

  orders: defineTable({
    userId: v.optional(v.id("users")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    customerAddress: v.string(),
    customerCity: v.string(),
    items: v.array(
      v.object({
        productId: v.string(), // Id<"products"> or Id<"packs"> — stored as string for flexibility
        productName: v.string(),
        quantity: v.number(),
        price: v.number(),
        weight: v.optional(v.string()),
        taste: v.optional(v.string()),
        isPack: v.optional(v.boolean()),
      })
    ),
    subtotal: v.number(),
    discount: v.optional(v.number()),
    couponCode: v.optional(v.string()),
    total: v.number(),
    status: v.string(),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_userId", ["userId"]),

  coupons: defineTable({
    code: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    usedCount: v.number(),
    active: v.boolean(),
    expiresAt: v.optional(v.string()),
  }).index("by_code", ["code"]),

  reviews: defineTable({
    productId: v.id("products"),
    userId: v.optional(v.id("users")),
    customerName: v.string(),
    rating: v.number(),
    comment: v.string(),
    approved: v.boolean(),
  }).index("by_product", ["productId"]),

  siteSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  customerNotes: defineTable({
    phone: v.string(),
    notes: v.string(),
  }).index("by_phone", ["phone"]),

  shippingRates: defineTable({
    wilayaCode: v.string(),
    wilayaName: v.string(),
    homeDeliveryCost: v.number(),
    deskDeliveryCost: v.number(),
    active: v.boolean(),
  }).index("by_code", ["wilayaCode"]),

  packs: defineTable({
    nameAr: v.string(),
    descriptionAr: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    productIds: v.array(v.id("products")), // kept for backwards compat
    packItems: v.optional(v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
      customWeight: v.optional(v.string()),
    }))),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    active: v.boolean(),
    slug: v.string(),
  })
    .index("by_active", ["active"])
    .index("by_slug", ["slug"]),
});
