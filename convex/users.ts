import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const updateCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: identity.name,
        email: identity.email,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name,
      email: identity.email,
      role: "customer",
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Auth bypassed for local development
    return {
      _id: "admin_mock_id" as any,
      _creationTime: 0,
      tokenIdentifier: "mock",
      name: "Admin (Local)",
      email: "admin@local",
      role: "admin",
    };
  },
});

export const setAdminRole = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Auth bypassed for local development
    await ctx.db.patch(args.userId, { role: "admin" });
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    // Auth bypassed for local development
    return await ctx.db.query("users").collect();
  },
});
