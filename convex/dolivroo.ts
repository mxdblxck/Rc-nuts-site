"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const createParcel = internalAction({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    console.log(`[Dolivroo Action] Started for order: ${args.orderId}`);
    
    const apiKey = process.env.DOLIVROO_API_KEY;
    if (!apiKey) {
      console.warn("DOLIVROO_API_KEY is not set. Cannot create parcel.");
      return;
    }

    // Fetch order details using an internal query
    const order = await ctx.runQuery(internal.orders.getOrderById, { orderId: args.orderId });
    if (!order) {
      throw new Error(`Order ${args.orderId} not found`);
    }

    // Parse customer city and commune if formatted as "Wilaya - Commune"
    const cityParts = order.customerCity.split("-").map(p => p.trim());
    const wilaya = cityParts[0] || "Alger"; // Fallback to Alger
    const commune = cityParts.length > 1 ? cityParts[1] : wilaya;

    // Split customer name into first and last name
    const nameParts = order.customerName.split(" ");
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(" ") || "Client";

    // Format products string
    const productsStr = order.items
      .map(item => `${item.productName} (x${item.quantity})`)
      .join(", ");

    // Determine delivery type
    const deliveryType = order.deliveryOption === "office" ? "stopdesk" : "home";

    try {
      console.log(`Sending order ${order._id} to Dolivroo API...`);
      
      const payload: any = {
        company_code: "zrexpress",
        order: {
          customer: {
            first_name: firstName,
            last_name: lastName,
            phone: order.customerPhone,
            address: order.customerAddress || "Address not provided",
          },
          destination: {
            wilaya: wilaya,
            commune: commune,
          },
          package: {
            products: productsStr,
            weight: 1, // Default weight 1kg
          },
          payment: {
            amount: order.total,
          },
          options: {
            delivery_type: deliveryType,
          }
        }
      };

      const response: Response = await fetch("https://dolivroo.com/api/v1/unified/parcels", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dolivroo API Error: ${response.status} - ${errorText}`);
      }

      const parcel: any = await response.json();
      console.log(`Successfully created parcel for order ${order._id}. Tracking ID: ${parcel.tracking_id}`);
      
      // Update the order with tracking details
      await ctx.runMutation(internal.orders.updateOrderTracking, {
        orderId: args.orderId,
        trackingId: parcel.tracking_id,
        labelUrl: parcel.label_url, // Might be undefined if Dolivroo doesn't return it
      });

      return parcel;
    } catch (error) {
      console.error("Failed to create Dolivroo parcel:", error);
      throw error;
    }
  },
});
