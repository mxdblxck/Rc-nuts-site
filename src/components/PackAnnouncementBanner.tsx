import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Gift, Truck, X, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function PackAnnouncementBanner() {
  const activePacks = useQuery(api.packs.listActivePacks, {});
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !activePacks || activePacks.length === 0) return null;

  // Create items for marquee
  const marqueeItems = activePacks.map((featured, i) => {
    const discount = featured.originalPrice && featured.originalPrice > featured.price
      ? Math.round(((featured.originalPrice - featured.price) / featured.originalPrice) * 100)
      : null;
    
    return (
      <span key={i} className="inline-flex items-center gap-2 mx-4 text-xs sm:text-sm">
        <span className="flex items-center gap-1 font-bold whitespace-nowrap">
          <Gift className="w-3.5 h-3.5" />
          {featured.nameAr}
        </span>
        <span className="text-primary-foreground/70">|</span>
        <span className="font-bold whitespace-nowrap">
          {featured.price.toLocaleString("ar-DZ")} دج
          {discount && (
            <span className="mr-1 bg-white/20 text-[10px] font-bold px-1 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 font-bold bg-white/15 px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap">
          <Truck className="w-3 h-3" />
          توصيل مجاني
        </span>
        <Link
          to="/packs"
          className="flex items-center gap-1 text-[10px] font-bold bg-white/25 hover:bg-white/35 transition-colors px-2 py-1 rounded-full whitespace-nowrap"
        >
          اكتشف <ArrowLeft className="w-3 h-3" />
        </Link>
      </span>
    );
  });

  // Duplicate for smooth loop
  const allItems = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div className="relative bg-primary text-primary-foreground overflow-hidden" dir="rtl">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1/2 -translate-y-1/2 left-2 z-10 p-1.5 rounded-full hover:bg-white/20 transition-colors bg-primary/80 backdrop-blur-sm"
        aria-label="إغلاق"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Marquee container */}
      <div className="py-2.5 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-content inline-flex items-center">
            {allItems}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        .marquee-content {
          display: flex;
          animation: marquee 16s linear infinite;
          white-space: nowrap;
        }
        .marquee-content:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .marquee-content {
            animation-duration: 8s;
          }
        }
      `}</style>
    </div>
  );
}