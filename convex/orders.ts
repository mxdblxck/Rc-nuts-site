import { mutation, query, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    customerAddress: v.string(),
    customerCity: v.string(),
    items: v.array(
      v.object({
        productId: v.string(), // Id<"products"> or Id<"packs">
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
    paymentMethod: v.string(),
    deliveryOption: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let userId = undefined;
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();
      if (user) userId = user._id;
    }

    // Apply coupon if provided
    if (args.couponCode) {
      const coupon = await ctx.db
        .query("coupons")
        .withIndex("by_code", (q) => q.eq("code", args.couponCode!))
        .unique();
      if (coupon && coupon.active) {
        await ctx.db.patch(coupon._id, { usedCount: coupon.usedCount + 1 });
      }
    }

    const orderId = await ctx.db.insert("orders", {
      ...args,
      userId,
      status: "pending",
    });

    return orderId;
  },
});

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const listAllOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Auth bypassed for local development

    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: { orderId: v.id("orders"), status: v.string() },
  handler: async (ctx, args) => {
    // Auth bypassed for local development
    await ctx.db.patch(args.orderId, { status: args.status });

    console.log(`[Order Mutation] Status updated to: ${args.status} for order: ${args.orderId}`);

    // If the order status is set to 'confirmed' (تم التأكيد), trigger the Dolivroo delivery action
    if (args.status === "confirmed") {
      console.log(`[Order Mutation] Scheduling Dolivroo creation for order: ${args.orderId}`);
      await ctx.scheduler.runAfter(0, internal.dolivroo.createParcel, { orderId: args.orderId });
    }
  },
});

export const getOrderById = internalQuery({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const updateOrderTracking = internalMutation({
  args: {
    orderId: v.id("orders"),
    trackingId: v.string(),
    labelUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      trackingId: args.trackingId,
      labelUrl: args.labelUrl,
    });
  },
});

export const deleteOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    // Auth bypassed for local development
    await ctx.db.delete(args.orderId);
  },
});

export const getOrderStats = query({
  args: {},
  handler: async (ctx) => {
    // Auth bypassed for local development

    const allOrders = await ctx.db.query("orders").collect();
    const totalRevenue = allOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const pending = allOrders.filter((o) => o.status === "pending").length;
    const confirmed = allOrders.filter((o) => o.status === "confirmed").length;
    const shipped = allOrders.filter((o) => o.status === "shipped").length;
    const delivered = allOrders.filter((o) => o.status === "delivered").length;
    const cancelled = allOrders.filter((o) => o.status === "cancelled").length;

    // Product sales count
    const productSalesMap: Record<string, number> = {};
    const wilayaMap: Record<string, number> = {};

    for (const order of allOrders) {
      if (order.status !== "cancelled") {
        // Track products
        for (const item of order.items) {
          productSalesMap[item.productName] = (productSalesMap[item.productName] ?? 0) + item.quantity;
        }
        
        // Track Wilayas
        if (order.customerCity) {
          const wilaya = order.customerCity.split("-")[0].trim();
          wilayaMap[wilaya] = (wilayaMap[wilaya] ?? 0) + 1;
        }
      }
    }

    const productSales = Object.entries(productSalesMap).map(([name, quantity]) => ({
      name,
      quantity,
    })).sort((a, b) => b.quantity - a.quantity);

    const wilayaStats = Object.entries(wilayaMap).map(([name, count]) => ({
      name,
      value: count,
    })).sort((a, b) => b.value - a.value).slice(0, 7);

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    let revenueToday = 0;
    let revenueYesterday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;
    
    let ordersToday = 0;
    let ordersYesterday = 0;

    for (const order of allOrders) {
      if (order.status !== "cancelled") {
        const timeDiff = now - order._creationTime;
        if (timeDiff <= oneDay) {
          revenueToday += order.total;
          ordersToday += 1;
        } else if (timeDiff > oneDay && timeDiff <= oneDay * 2) {
          revenueYesterday += order.total;
          ordersYesterday += 1;
        }

        if (timeDiff <= oneWeek) revenueWeek += order.total;
        if (timeDiff <= oneMonth) revenueMonth += order.total;
      }
    }

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      revenueToday,
      revenueYesterday,
      revenueWeek,
      revenueMonth,
      ordersToday,
      ordersYesterday,
      pendingOrders: pending,
      confirmedOrders: confirmed,
      shippedOrders: shipped,
      deliveredOrders: delivered,
      cancelledOrders: cancelled,
      productSales,
      wilayaStats,
    };
  },
});

export const getCustomerStats = query({
  args: {},
  handler: async (ctx) => {
    const allOrders = await ctx.db.query("orders").collect();
    const notes = await ctx.db.query("customerNotes").collect();

    const customerMap = new Map<string, any>();

    for (const order of allOrders) {
      const phone = order.customerPhone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          name: order.customerName,
          phone: phone,
          totalSpent: 0,
          orderCount: 0,
          orders: [],
          note: notes.find((n) => n.phone === phone)?.notes || "",
        });
      }
      const customer = customerMap.get(phone);
      if (order.status !== "cancelled") {
        customer.totalSpent += order.total;
      }
      customer.orderCount += 1;
      customer.orders.push({
        id: order._id,
        date: order._creationTime,
        status: order.status,
        total: order.total,
      });
    }

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  },
});

export const saveCustomerNote = mutation({
  args: { phone: v.string(), note: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customerNotes")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { notes: args.note });
    } else {
      await ctx.db.insert("customerNotes", { phone: args.phone, notes: args.note });
    }
  },
});
