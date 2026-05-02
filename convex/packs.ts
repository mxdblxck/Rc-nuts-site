import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const packItemValidator = v.object({
  productId: v.id("products"),
  quantity: v.number(),
  customWeight: v.optional(v.string()),
});

// ── Public queries ──────────────────────────────────────────────

export const listActivePacks = query({
  args: {},
  handler: async (ctx) => {
    const packs = await ctx.db
      .query("packs")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
    return Promise.all(packs.map((pack) => resolvePack(ctx, pack)));
  },
});

export const getPackBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const pack = await ctx.db
      .query("packs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!pack) return null;
    return resolvePack(ctx, pack);
  },
});

export const listAllPacks = query({
  args: {},
  handler: async (ctx) => {
    const packs = await ctx.db.query("packs").collect();
    return Promise.all(packs.map((pack) => resolvePack(ctx, pack)));
  },
});

// ── Admin mutations ─────────────────────────────────────────────

export const createPack = mutation({
  args: {
    nameAr: v.string(),
    descriptionAr: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    packItems: v.array(packItemValidator),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    active: v.boolean(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const productIds = args.packItems.map((i) => i.productId);
    return await ctx.db.insert("packs", { ...args, productIds });
  },
});

export const updatePack = mutation({
  args: {
    id: v.id("packs"),
    nameAr: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    packItems: v.optional(v.array(packItemValidator)),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    active: v.optional(v.boolean()),
    slug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    // Keep productIds in sync for backwards compat
    const patch: any = { ...rest };
    if (rest.packItems) {
      patch.productIds = rest.packItems.map((i) => i.productId);
    }
    await ctx.db.patch(id, patch);
  },
});

export const togglePackActive = mutation({
  args: { id: v.id("packs"), active: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { active: args.active });
  },
});

export const deletePack = mutation({
  args: { id: v.id("packs") },
  handler: async (ctx, args) => {
    const pack = await ctx.db.get(args.id);
    if (pack?.imageStorageId) {
      await ctx.storage.delete(pack.imageStorageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// ── Helper ──────────────────────────────────────────────────────

async function resolvePack(ctx: any, pack: any) {
  if (pack.imageStorageId) {
    pack.imageUrl = (await ctx.storage.getUrl(pack.imageStorageId)) ?? pack.imageUrl;
  }

  // Use packItems if available, fall back to productIds for old records
  const items: { productId: any; quantity: number; customWeight?: string }[] =
    pack.packItems && pack.packItems.length > 0
      ? pack.packItems
      : (pack.productIds ?? []).map((pid: any) => ({ productId: pid, quantity: 1 }));

  const resolvedProducts = await Promise.all(
    items.map(async (item) => {
      const p = await ctx.db.get(item.productId);
      if (!p) return null;
      if (p.imageStorageId) {
        p.imageUrl = (await ctx.storage.getUrl(p.imageStorageId)) ?? p.imageUrl;
      }
      return {
        ...p,
        quantity: item.quantity,
        displayWeight: item.customWeight ?? p.weight ?? "",
      };
    })
  );

  return { ...pack, products: resolvedProducts.filter(Boolean) };
}
