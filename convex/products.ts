import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

<<<<<<< HEAD
// Helper to resolve storage URLs for a product
// Final `images` array = [mainImage, ...galleryImages] — main image is always first
async function resolveProductUrls(ctx: any, p: any) {
  // Resolve main image from storage if needed
  if (p.imageStorageId) {
    p.imageUrl = (await ctx.storage.getUrl(p.imageStorageId)) ?? p.imageUrl;
  }

  // Resolve gallery images from storage IDs
  let galleryUrls: string[] = [];
  if (p.galleryStorageIds && p.galleryStorageIds.length > 0) {
    const resolved = await Promise.all(
      p.galleryStorageIds.map((id: any) => ctx.storage.getUrl(id))
    );
    galleryUrls = resolved.filter(Boolean) as string[];
  }

  // Also include any external-URL gallery entries (p.images stored as plain strings)
  const externalGallery: string[] = (p.images ?? []).filter(
    (url: string) => !url.startsWith("blob:")
  );

  // Build final images array: main image first, then gallery (storage-resolved + external URLs)
  const allGallery = [...galleryUrls, ...externalGallery];
  const mainImage = p.imageUrl ?? null;

  if (mainImage) {
    // Deduplicate: don't add mainImage again if it's already in gallery
    const rest = allGallery.filter((u) => u !== mainImage);
    p.images = [mainImage, ...rest];
  } else if (allGallery.length > 0) {
    p.images = allGallery;
  } else {
    p.images = [];
  }

  return p;
}

=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
// Public queries
export const listProducts = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
<<<<<<< HEAD
    let products;
    if (args.featured) {
      products = await ctx.db
        .query("products")
        .withIndex("by_featured", (q) => q.eq("featured", true))
        .collect();
    } else if (args.category) {
      products = await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else {
      products = await ctx.db.query("products").collect();
    }
    return Promise.all(products.map((p) => resolveProductUrls(ctx, p)));
=======
    if (args.featured) {
      return await ctx.db
        .query("products")
        .withIndex("by_featured", (q) => q.eq("featured", true))
        .collect();
    }
    if (args.category) {
      return await ctx.db
        .query("products")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    }
    const products = await ctx.db.query("products").collect();
    return Promise.all(products.map(async (p) => {
      if (p.imageStorageId) p.imageUrl = await ctx.storage.getUrl(p.imageStorageId) ?? p.imageUrl;
      if (p.galleryStorageIds) p.images = await Promise.all(p.galleryStorageIds.map((id: any) => ctx.storage.getUrl(id))) as string[];
      return p;
    }));
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
  },
});

export const getProductBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (product) {
<<<<<<< HEAD
      return resolveProductUrls(ctx, product);
=======
      if (product.imageStorageId) product.imageUrl = await ctx.storage.getUrl(product.imageStorageId) ?? product.imageUrl;
      if (product.galleryStorageIds) product.images = await Promise.all(product.galleryStorageIds.map((id: any) => ctx.storage.getUrl(id))) as string[];
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
    }
    return product;
  },
});

export const getProduct = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (product) {
<<<<<<< HEAD
      return resolveProductUrls(ctx, product);
=======
      if (product.imageStorageId) product.imageUrl = await ctx.storage.getUrl(product.imageStorageId) ?? product.imageUrl;
      if (product.galleryStorageIds) product.images = await Promise.all(product.galleryStorageIds.map((id: any) => ctx.storage.getUrl(id))) as string[];
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
    }
    return product;
  },
});

// Admin mutations
async function requireAdmin(ctx: any) {
  // Auth bypassed for local development
  return { _id: "mock", role: "admin" };
}

const productArgs = {
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
};

export const createProduct = mutation({
  args: productArgs,
  handler: async (ctx, args) => {
    await requireAdmin(ctx as Parameters<typeof requireAdmin>[0]);
    return await ctx.db.insert("products", args);
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    nameAr: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    benefitsAr: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.string())),
    galleryStorageIds: v.optional(v.array(v.id("_storage"))),
    inStock: v.optional(v.boolean()),
    stockQuantity: v.optional(v.number()),
    weight: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    slug: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx as Parameters<typeof requireAdmin>[0]);
    const { id, ...rest } = args;
    
    // Cleanup replaced storage files
    const existing = await ctx.db.get(id);
    if (existing) {
      if (rest.imageStorageId !== undefined && existing.imageStorageId && rest.imageStorageId !== existing.imageStorageId) {
        await ctx.storage.delete(existing.imageStorageId);
      }
      if (rest.galleryStorageIds !== undefined && existing.galleryStorageIds) {
        const removedIds = existing.galleryStorageIds.filter(oldId => !rest.galleryStorageIds?.includes(oldId));
        for (const rId of removedIds) {
          await ctx.storage.delete(rId);
        }
      }
    }

    await ctx.db.patch(id, rest);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx as Parameters<typeof requireAdmin>[0]);
    
    // Cleanup storage files before deleting document
    const product = await ctx.db.get(args.id);
    if (product) {
      if (product.imageStorageId) {
        await ctx.storage.delete(product.imageStorageId);
      }
      if (product.galleryStorageIds) {
        for (const rId of product.galleryStorageIds) {
          await ctx.storage.delete(rId);
        }
      }
    }

    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  await requireAdmin(ctx as Parameters<typeof requireAdmin>[0]);
  return await ctx.storage.generateUploadUrl();
});

export const seedProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("products").collect();
    if (existing.length > 0) return "already seeded";

    const products = [
      {
        nameAr: "بذور اليقطين",
        descriptionAr: "بذور يقطين طازجة ومحمصة بعناية، غنية بالمغنيسيوم والزنك وأحماض أوميغا-3. مثالية للوجبات الخفيفة الصحية.",
        benefitsAr: ["غني بالمغنيسيوم", "مصدر ممتاز للزنك", "يدعم صحة القلب", "مضاد للأكسدة"],
        category: "بذور",
        price: 1000,
        originalPrice: 1350,
        imageUrl: "https://images.unsplash.com/photo-1579123521389-2a1405a03966?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 50,
        weight: "250 غرام",
        featured: true,
        slug: "pumpkin-seeds",
      },
      {
        nameAr: "بندق جودة ممتازة",
        descriptionAr: "بندق فاخر من أجود المصادر، محمص ومقشر، غني بفيتامين E والدهون الصحية. لذيذ ومغذي.",
        benefitsAr: ["غني بفيتامين E", "يحسن صحة الدماغ", "يدعم القلب", "مضاد للالتهابات"],
        category: "مكسرات",
        price: 1750,
        originalPrice: 2200,
        imageUrl: "https://images.unsplash.com/photo-1614807618309-9de716b16eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 30,
        weight: "250 غرام",
        featured: true,
        slug: "premium-hazelnuts",
      },
      {
        nameAr: "بيسطاش جودة ممتازة",
        descriptionAr: "فستق حلبي ممتاز من أفضل البساتين، محمص بالملح الطبيعي. غني بالبروتين والألياف.",
        benefitsAr: ["غني بالبروتين", "يخفض الكوليسترول", "يدعم الجهاز المناعي", "لذيذ ومشبع"],
        category: "مكسرات",
        price: 1650,
        originalPrice: 1950,
        imageUrl: "https://images.unsplash.com/photo-1704079662049-d00890d21a69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 40,
        weight: "250 غرام",
        featured: true,
        slug: "premium-pistachios",
      },
      {
        nameAr: "جوز جودة ممتازة",
        descriptionAr: "جوز طازج عالي الجودة، مصدر رائع لأوميغا-3 والمعادن الأساسية. مناسب للعقل والقلب.",
        benefitsAr: ["أوميغا-3 طبيعية", "يقوي الذاكرة", "مضاد للأكسدة", "يحسن المزاج"],
        category: "مكسرات",
        price: 1100,
        originalPrice: 1450,
        imageUrl: "https://images.unsplash.com/photo-1618453731654-3eb0816cd121?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 25,
        weight: "250 غرام",
        featured: false,
        slug: "premium-walnuts",
      },
      {
        nameAr: "خلطة العسل الحر و المكسرات",
        descriptionAr: "مزيج فريد من العسل الطبيعي البلدي مع أجود المكسرات المختارة. طاقة طبيعية ومذاق استثنائي.",
        benefitsAr: ["طاقة طبيعية", "عسل بلدي أصيل", "مقوي للمناعة", "مغذي ولذيذ"],
        category: "خلطات",
        price: 1850,
        originalPrice: 2200,
        imageUrl: "https://images.unsplash.com/photo-1600973772995-d72ec49d6596?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 20,
        weight: "300 غرام",
        featured: true,
        slug: "honey-nuts-mix",
      },
      {
        nameAr: "خليط زبيب",
        descriptionAr: "زبيب مجفف طبيعي بدون مواد حافظة، غني بالحديد والطاقة. مناسب للأطفال والرياضيين.",
        benefitsAr: ["غني بالحديد", "طاقة سريعة", "بدون حافظات", "مناسب للرياضيين"],
        category: "مجففات",
        price: 850,
        originalPrice: 1250,
        imageUrl: "https://images.unsplash.com/photo-1642102903918-b97c37955bbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 60,
        weight: "250 غرام",
        featured: false,
        slug: "raisin-mix",
      },
      {
        nameAr: "خليط مكسرات",
        descriptionAr: "تشكيلة فاخرة من أجود المكسرات المختارة يدوياً: جوز، لوز، كاجو، بندق وفستق. وجبة خفيفة متكاملة.",
        benefitsAr: ["تشكيلة متنوعة", "مختارة يدوياً", "بروتين كامل", "مثالي للمكتب والسفر"],
        category: "خلطات",
        price: 2450,
        originalPrice: 2750,
        imageUrl: "https://images.unsplash.com/photo-1693812879565-c0cf703dd7b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 35,
        weight: "300 غرام",
        featured: true,
        slug: "mixed-nuts",
      },
      {
        nameAr: "كاجو جودة ممتازة",
        descriptionAr: "كاجو هندي فاخر محمص ومملح بخفة، ذو نكهة كريمية رائعة. غني بالمغنيسيوم والنحاس.",
        benefitsAr: ["غني بالمغنيسيوم", "يحسن المناعة", "يدعم العظام", "مذاق كريمي رائع"],
        category: "مكسرات",
        price: 1650,
        originalPrice: 1950,
        imageUrl: "https://images.unsplash.com/photo-1661836990173-97481f67f85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 45,
        weight: "250 غرام",
        featured: false,
        slug: "premium-cashews",
      },
      {
        nameAr: "لوز جودة ممتازة",
        descriptionAr: "لوز أمريكي درجة أولى، محمص طبيعياً. مصدر ممتاز لفيتامين E والكالسيوم والبروتين النباتي.",
        benefitsAr: ["غني بفيتامين E", "يدعم صحة العظام", "بروتين نباتي", "يشبع لوقت طويل"],
        category: "مكسرات",
        price: 1500,
        originalPrice: 1750,
        imageUrl: "https://images.unsplash.com/photo-1614807618309-9de716b16eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: true,
        stockQuantity: 30,
        weight: "250 غرام",
        featured: false,
        slug: "premium-almonds",
      },
      {
        nameAr: "تين مجفف",
        descriptionAr: "تين مجفف طبيعي من أجود الأصناف، حلو الطعم غني بالألياف والكالسيوم والحديد. مثالي كوجبة خفيفة صحية.",
        benefitsAr: ["غني بالألياف", "مصدر طبيعي للكالسيوم", "يحسن الهضم", "طاقة طبيعية"],
        category: "مجففات",
        price: 950,
        originalPrice: 1200,
        imageUrl: "https://images.unsplash.com/photo-1556843824-256570ca21c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
        inStock: false,
        stockQuantity: 0,
        weight: "250 غرام",
        featured: false,
        slug: "dried-figs",
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }
    return "seeded";
  },
});
