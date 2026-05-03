import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Telegram Notification Action - sends order notifications to admin via Telegram bot
 * Called from frontend after order is placed
 */
export const sendOrderNotification = action({
  args: {
    orderId: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    customerCity: v.string(),
    customerAddress: v.string(),
    total: v.number(),
    items: v.array(
      v.object({
        productName: v.string(),
        quantity: v.number(),
        price: v.number(),
        weight: v.optional(v.string()),
      })
    ),
    paymentMethod: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Skip if not configured
    if (!botToken || !chatId) {
      console.log("[Telegram] Missing config");
      return { success: false, error: "Not configured" };
    }

    try {
      // Format items
      const itemsList = args.items
        .map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) =>
            `• ${item.productName} ×${item.quantity} - ${item.price.toLocaleString()} دج${item.weight ? ` (${item.weight})` : ""}`
        )
        .join("\n");

      const message = `🛒 *طلب جديد*

👤 *الزبون:* ${args.customerName}
📱 *الهاتف:* ${args.customerPhone}
📍 *الولاية:* ${args.customerCity}
📝 *العنوان:* ${args.customerAddress}

🛍️ *المنتجات:*
${itemsList}

💰 *الإجمالي:* ${args.total.toLocaleString()} دج
💳 *طريقة الدفع:* ${args.paymentMethod === "cod" ? " عند الاستلام" : " تحويل بنكي"}
${args.notes ? `📌 *ملاحظة:* ${args.notes}` : ""}

🕐 *التاريخ:* ${new Date().toLocaleString("ar-DZ", { timeZone: "Africa/Algiers" })}`;

      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Telegram] API error:", error);
        return { success: false, error };
      }

      console.log("[Telegram] Sent:", args.orderId);
      return { success: true };
    } catch (error) {
      console.error("[Telegram] Failed:", error);
      return { success: false, error: String(error) };
    }
  },
});