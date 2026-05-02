import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const validateCoupon = query({
  args: { code: v.string(), orderAmount: v.number() },
  handler: async (ctx, args) => {
    const coupon = await ctx.db
      .query("coupons")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (!coupon || !coupon.active) return { valid: false, message: "كود الخصم غير صالح" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: "انتهت صلاحية كود الخصم" };
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: "تم استنفاد كود الخصم" };
    }
    if (coupon.minOrderAmount && args.orderAmount < coupon.minOrderAmount) {
      return { valid: false, message: `الحد الأدنى للطلب ${coupon.minOrderAmount} دج` };
    }
    const discount =
      coupon.discountType === "percentage"
        ? Math.round((args.orderAmount * coupon.discountValue) / 100)
        : coupon.discountValue;
    return { valid: true, discount, coupon };
  },
});

export const createCoupon = mutation({
  args: {
    code: v.string(),
    discountType: v.string(),
    discountValue: v.number(),
    minOrderAmount: v.optional(v.number()),
    maxUses: v.optional(v.number()),
    active: v.boolean(),
    expiresAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth bypassed for local development
    return await ctx.db.insert("coupons", { ...args, usedCount: 0 });
  },
});

export const listCoupons = query({
  args: {},
  handler: async (ctx) => {
    // Auth bypassed for local development
    return await ctx.db.query("coupons").collect();
  },
});

export const toggleCoupon = mutation({
  args: { id: v.id("coupons"), active: v.boolean() },
  handler: async (ctx, args) => {
    // Auth bypassed for local development
    await ctx.db.patch(args.id, { active: args.active });
  },
});
