import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Gift, Truck, X } from "lucide-react";
import { useState } from "react";

export default function PackAnnouncementBanner() {
  const activePacks = useQuery(api.packs.listActivePacks, {});
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !activePacks || activePacks.length === 0) return null;

  const featured = activePacks[0];
  const discount =
    featured.originalPrice && featured.originalPrice > featured.price
      ? Math.round(((featured.originalPrice - featured.price) / featured.originalPrice) * 100)
      : null;

  return (
    <div className="relative bg-primary text-primary-foreground overflow-hidden" dir="rtl">
      {/* Shimmer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-y-0 -left-full w-1/3 bg-white/10 skew-x-12 animate-[shimmer_3s_ease-in-out_infinite]" />
      </div>

      {/* Mobile layout: stacked */}
      <div className="md:hidden px-3 py-2">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          {/* Pack name + price */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Gift className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-black truncate">{featured.nameAr}</span>
            <span className="text-xs font-bold shrink-0">
              {featured.price.toLocaleString("ar-DZ")} دج
              {discount && (
                <span className="mr-1 bg-white/20 text-[10px] font-bold px-1 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
            </span>
          </div>
          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        {/* Second row: free shipping + CTA */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-white/15 px-2 py-0.5 rounded-full">
            <Truck className="w-3 h-3" />
            توصيل مجاني
          </span>
          <Link
            to="/packs"
            className="text-[10px] font-bold bg-white/25 hover:bg-white/35 transition-colors px-2.5 py-1 rounded-full whitespace-nowrap"
          >
            اكتشف الباقات ←
          </Link>
        </div>
      </div>

      {/* Desktop layout: single row */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-3">
        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Center */}
        <div className="flex-1 flex items-center justify-center gap-3 text-sm flex-wrap">
          <span className="flex items-center gap-1.5 font-black">
            <Gift className="w-4 h-4 shrink-0" />
            باقة خاصة: {featured.nameAr}
          </span>
          <span className="text-primary-foreground/80">—</span>
          <span className="text-primary-foreground/90">
            {featured.price.toLocaleString("ar-DZ")} دج
            {discount && (
              <span className="mr-1 bg-white/20 text-xs font-bold px-1.5 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 font-bold bg-white/15 px-2.5 py-0.5 rounded-full text-xs">
            <Truck className="w-3 h-3" />
            توصيل مجاني
          </span>
        </div>

        {/* CTA */}
        <Link
          to="/packs"
          className="shrink-0 text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full whitespace-nowrap"
        >
          اكتشف الباقات ←
        </Link>
      </div>
    </div>
  );
}
