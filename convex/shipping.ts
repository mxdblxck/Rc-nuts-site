import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireAdmin(ctx: any) {
  // Auth bypassed for local development
  return { _id: "mock", role: "admin" };
}

export const getShippingRates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("shippingRates").collect();
  },
});

export const updateShippingRate = mutation({
  args: {
    id: v.id("shippingRates"),
    homeDeliveryCost: v.number(),
    deskDeliveryCost: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx as Parameters<typeof requireAdmin>[0]);
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

// Seed data based on public/algeria_cities.csv or a predefined array
export const initShippingRates = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx as Parameters<typeof requireAdmin>[0]);
    
    const zrExpressRates = [
      { "wilaya_ar": "أدرار", "domicile": 1400, "stopdesk": 970 },
      { "wilaya_ar": "الشلف", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "الأغواط", "domicile": 950, "stopdesk": 670 },
      { "wilaya_ar": "أم البواقي", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "باتنة", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "بجاية", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "بسكرة", "domicile": 950, "stopdesk": 670 },
      { "wilaya_ar": "بشار", "domicile": 1050, "stopdesk": 720 },
      { "wilaya_ar": "البليدة", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "البويرة", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "تمنراست", "domicile": 1600, "stopdesk": 1120 },
      { "wilaya_ar": "تبسة", "domicile": 850, "stopdesk": 520 },
      { "wilaya_ar": "تلمسان", "domicile": 700, "stopdesk": 520 },
      { "wilaya_ar": "تيارت", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "تيزي وزو", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "الجزائر", "domicile": 650, "stopdesk": 470 },
      { "wilaya_ar": "الجلفة", "domicile": 950, "stopdesk": 670 },
      { "wilaya_ar": "جيجل", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "سطيف", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "سعيدة", "domicile": 750, "stopdesk": 670 },
      { "wilaya_ar": "قالمة", "domicile": 850, "stopdesk": 520 },
      { "wilaya_ar": "قسنطينة", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "المدية", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "مستغانم", "domicile": 700, "stopdesk": 520 },
      { "wilaya_ar": "المسيلة", "domicile": 900, "stopdesk": 570 },
      { "wilaya_ar": "معسكر", "domicile": 700, "stopdesk": 520 },
      { "wilaya_ar": "ورقلة", "domicile": 950, "stopdesk": 720 },
      { "wilaya_ar": "وهران", "domicile": 400, "stopdesk": 370 },
      { "wilaya_ar": "البيض", "domicile": 1000, "stopdesk": 670 },
      { "wilaya_ar": "إليزي", "domicile": 0, "stopdesk": 0 },
      { "wilaya_ar": "برج بوعريريج", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "بومرداس", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "الطارف", "domicile": 850, "stopdesk": 520 },
      { "wilaya_ar": "تندوف", "domicile": 0, "stopdesk": 0 },
      { "wilaya_ar": "تيسمسيلت", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "الوادي", "domicile": 950, "stopdesk": 720 },
      { "wilaya_ar": "خنشلة", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "سوق أهراس", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "تيبازة", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "ميلة", "domicile": 800, "stopdesk": 520 },
      { "wilaya_ar": "عين الدفلى", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "النعامة", "domicile": 1000, "stopdesk": 670 },
      { "wilaya_ar": "عين تموشنت", "domicile": 650, "stopdesk": 520 },
      { "wilaya_ar": "غرداية", "domicile": 950, "stopdesk": 670 },
      { "wilaya_ar": "غليزان", "domicile": 750, "stopdesk": 520 },
      { "wilaya_ar": "تيميمون", "domicile": 1400, "stopdesk": 970 },
      { "wilaya_ar": "عين صالح", "domicile": 1600, "stopdesk": 0 },
      { "wilaya_ar": "عين قزام", "domicile": 1600, "stopdesk": 0 },
      { "wilaya_ar": "تقرت", "domicile": 950, "stopdesk": 720 },
      { "wilaya_ar": "جانت", "domicile": 0, "stopdesk": 0 },
      { "wilaya_ar": "المغير", "domicile": 950, "stopdesk": 0 },
      { "wilaya_ar": "المنيعة", "domicile": 950, "stopdesk": 0 },
      // Added missing new wilayas from the other list
      { "wilaya_ar": "برج باجي مختار", "domicile": 1600, "stopdesk": 0 },
      { "wilaya_ar": "أولاد جلال", "domicile": 950, "stopdesk": 670 },
      { "wilaya_ar": "بني عباس", "domicile": 1400, "stopdesk": 970 }
    ];

    const existing = await ctx.db.query("shippingRates").collect();

    // If empty, insert them
    if (existing.length === 0) {
      // Create a map of the default 58 wilayas to match codes and names
      const defaultWilayas = [
        { code: "01", name: "أدرار" }, { code: "02", name: "الشلف" }, { code: "03", name: "الأغواط" },
        { code: "04", name: "أم البواقي" }, { code: "05", name: "باتنة" }, { code: "06", name: "بجاية" },
        { code: "07", name: "بسكرة" }, { code: "08", name: "بشار" }, { code: "09", name: "البليدة" },
        { code: "10", name: "البويرة" }, { code: "11", name: "تمنراست" }, { code: "12", name: "تبسة" },
        { code: "13", name: "تلمسان" }, { code: "14", name: "تيارت" }, { code: "15", name: "تيزي وزو" },
        { code: "16", name: "الجزائر" }, { code: "17", name: "الجلفة" }, { code: "18", name: "جيجل" },
        { code: "19", name: "سطيف" }, { code: "20", name: "سعيدة" }, { code: "21", name: "سكيكدة" },
        { code: "22", name: "سيدي بلعباس" }, { code: "23", name: "عنابة" }, { code: "24", name: "قالمة" },
        { code: "25", name: "قسنطينة" }, { code: "26", name: "المدية" }, { code: "27", name: "مستغانم" },
        { code: "28", name: "المسيلة" }, { code: "29", name: "معسكر" }, { code: "30", name: "ورقلة" },
        { code: "31", name: "وهران" }, { code: "32", name: "البيض" }, { code: "33", name: "إليزي" },
        { code: "34", name: "برج بوعريريج" }, { code: "35", name: "بومرداس" }, { code: "36", name: "الطارف" },
        { code: "37", name: "تندوف" }, { code: "38", name: "تيسمسيلت" }, { code: "39", name: "الوادي" },
        { code: "40", name: "خنشلة" }, { code: "41", name: "سوق أهراس" }, { code: "42", name: "تيبازة" },
        { code: "43", name: "ميلة" }, { code: "44", name: "عين الدفلى" }, { code: "45", name: "النعامة" },
        { code: "46", name: "عين تموشنت" }, { code: "47", name: "غرداية" }, { code: "48", name: "غليزان" },
        { code: "49", name: "تيميمون" }, { code: "50", name: "برج باجي مختار" }, { code: "51", name: "أولاد جلال" },
        { code: "52", name: "بني عباس" }, { code: "53", name: "عين صالح" }, { code: "54", name: "عين قزام" },
        { code: "55", name: "تقرت" }, { code: "56", name: "جانت" }, { code: "57", name: "المغير" },
        { code: "58", name: "المنيعة" }
      ];

      for (const w of defaultWilayas) {
        const zrRate = zrExpressRates.find(r => r.wilaya_ar === w.name);
        await ctx.db.insert("shippingRates", {
          wilayaCode: w.code,
          wilayaName: w.name,
          homeDeliveryCost: zrRate?.domicile ?? 0,
          deskDeliveryCost: zrRate?.stopdesk ?? 0,
          active: (zrRate?.domicile ?? 0) > 0 || (zrRate?.stopdesk ?? 0) > 0,
        });
      }
      return "Inserted 58 wilayas with ZR Express rates";
    }

    // If already exists, just update
    for (const w of existing) {
      const zrRate = zrExpressRates.find(r => r.wilaya_ar === w.wilayaName);
      if (zrRate) {
        await ctx.db.patch(w._id, {
          homeDeliveryCost: zrRate.domicile,
          deskDeliveryCost: zrRate.stopdesk,
          active: zrRate.domicile > 0 || zrRate.stopdesk > 0, // Disable if 0
        });
      }
    }

    return "Updated existing ZR Express rates";
  },
});
