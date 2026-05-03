import { httpAction } from "./_generated/server";

/**
 * Telegram HTTP Action - sends order notifications to admin via Telegram bot
 * Called from frontend after order is placed
 */
export const sendOrderNotification = httpAction(async (ctx, request) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Skip if not configured
  if (!botToken || !chatId) {
    return new Response(JSON.stringify({ error: "Not configured" }), { status: 200 });
  }

  try {
    const args = await request.json();

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
      console.error("[Telegram] Error:", await response.text());
      return new Response(JSON.stringify({ error: "Telegram API error" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("[Telegram] Failed:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
});