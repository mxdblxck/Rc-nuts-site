import { action } from "./_generated/server";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  weight?: string;
}

interface SendOrderNotificationArgs {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerCity: string;
  customerAddress: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  notes?: string;
}

/**
 * Telegram Notification Action
 * Sends order notifications to admin via Telegram bot
 */
export const sendOrderNotification = action({
  args: {
    orderId: "string",
    customerName: "string",
    customerPhone: "string",
    customerCity: "string",
    customerAddress: "string",
    total: "number",
    items: "array",
    paymentMethod: "string",
    notes: "optional",
  },
  handler: async (_ctx, args): Promise<void> => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Skip if not configured
    if (!botToken || !chatId) {
      console.log("[Telegram] Not configured - missing token or chatId");
      return;
    }

    // Format items list
    const itemsList = args.items
      .map(
        (item: { productName: string; quantity: number; price: number; weight?: string }) =>
          `• ${item.productName} ×${item.quantity} - ${item.price.toLocaleString()} دج${item.weight ? ` (${item.weight})` : ""}`
      )
      .join("\n");

    // Build message with Markdown
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

    try {
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
      } else {
        console.log("[Telegram] Order notification sent:", args.orderId);
      }
    } catch (error) {
      console.error("[Telegram] Failed to send:", error);
    }
  },
});