import { useState, useMemo } from "react";
import { Search, Download, User, Phone, MapPin, FileText, Tag, Star, Filter, X, ChevronDown, ChevronUp, Loader2, FileSpreadsheet, Building, Calendar, Wallet, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import * as XLSX from "xlsx";

type CustomerStat = {
  name: string;
  phone: string;
  city?: string;
  wilaya?: string;
  orderCount: number;
  totalSpent: number;
  note?: string;
  lastOrderDate?: number;
  tags?: string[];
};

type Props = {
  customerStats: CustomerStat[] | undefined;
};

const availableTags = [
  { id: "vip", label: "VIP", color: "bg-amber-100 text-amber-700 border-amber-300" },
  { id: "regular", label: "مستهلك", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { id: "new", label: "جديد", color: "bg-green-100 text-green-700 border-green-300" },
  { id: "problem", label: "مشكلة", color: "bg-red-100 text-red-700 border-red-300" },
];

export default function AdminCustomersTab({ customerStats }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "total" | "orders" | "date">("total");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const saveCustomerNote = useMutation(api.orders.saveCustomerNote);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    if (!customerStats) return [];
    
    let filtered = customerStats.filter((c: CustomerStat) => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        c.name?.toLowerCase().includes(searchLower) ||
        c.phone?.includes(search) ||
        c.wilaya?.toLowerCase().includes(searchLower) ||
        c.city?.toLowerCase().includes(searchLower)
      );
    });

    filtered.sort((a: CustomerStat, b: CustomerStat) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "total":
          comparison = (a.totalSpent || 0) - (b.totalSpent || 0);
          break;
        case "orders":
          comparison = (a.orderCount || 0) - (b.orderCount || 0);
          break;
        case "date":
          comparison = (a.lastOrderDate || 0) - (b.lastOrderDate || 0);
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [customerStats, search, sortBy, sortOrder]);

  // Export to Excel (.xlsx) - Professional styling
  const exportToExcel = () => {
    if (!filteredCustomers.length) {
      toast.error("لا يوجد بيانات للتصدير");
      return;
    }

    // Create Excel data
    const data = filteredCustomers.map((c: CustomerStat) => ({
      "الاسم الكامل": c.name || "",
      "رقم الهاتف": c.phone || "",
      "الولاية": c.wilaya || "",
      "البلدية": c.city || "",
      "عدد الطلبات": c.orderCount || 0,
      "إجمالي الإنفاق (دج)": c.totalSpent || 0,
      "تاريخ آخر طلب": c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("ar-DZ") : "-",
      "الوسوم": c.tags?.join(", ") || "-",
      "ملاحظات": c.note || "-",
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 25 }, // الاسم الكامل
      { wch: 15 }, // رقم الهاتف
      { wch: 18 }, // الولاية
      { wch: 18 }, // البلدية
      { wch: 12 }, // عدد الطلبات
      { wch: 18 }, // إجمالي الإنفاق
      { wch: 15 }, // تاريخ آخر طلب
      { wch: 20 }, // الوسوم
      { wch: 35 }, // ملاحظات
    ];

    // Professional header styling
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const addr = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[addr]) continue;
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, // White text
        fill: { fgColor: { rgb: "4A7C59" }, // Olive green
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "3D5C49" } },
          bottom: { style: "thin", color: { rgb: "3D5C49" } },
          left: { style: "thin", color: { rgb: "3D5C49" } },
          right: { style: "thin", color: { rgb: "3D5C49" } },
        },
      };
    }

    // Alternate row colors for readability
    for (let row = 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const addr = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[addr]) continue;
        const isEven = row % 2 === 0;
        ws[addr].s = {
          ...ws[addr].s,
          fill: { fgColor: isEven ? { rgb: "F5F5DC" } : { rgb: "FFFFFF" } }, // Beige / White
          alignment: { horizontal: "center" },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "الزبائن");

    // Download
    XLSX.writeFile(wb, `زبائن_RC_Nuts_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("تم تصدير الملف بنجاح");
  };

  if (customerStats === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">الزبائن</h1>
          <p className="text-sm text-muted-foreground mt-1">{customerStats.length} زبونمسجل</p>
        </div>
        <Button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4 mr-2" />
          تصدير Excel
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="البحث بالاسم، الهاتف، أو الولاية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split("-");
            setSortBy(by as any);
            setSortOrder(order as any);
          }}
          className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="total-desc">الأعلى إنفاقا</option>
          <option value="total-asc">الأقل إنفاقا</option>
          <option value="orders-desc">الأكثر طلبات</option>
          <option value="orders-asc">الأقل طلبات</option>
          <option value="date-desc">الأحدث طلب</option>
          <option value="date-asc">الأقدم طلب</option>
          <option value="name-asc">الاسم (أ-ي)</option>
          <option value="name-desc">الاسم (ي-أ)</option>
        </select>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-muted-foreground">
          {filteredCustomers.length} نتيجة من {customerStats.length} زبون
        </p>
      )}

      {/* Customer Cards - Premium Design */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-2xl">
          <User className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-medium">لا يوجد عملاء_matches kriteria</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map((c: CustomerStat) => (
            <div
              key={c.phone}
              className={`bg-card border-2 rounded-2xl p-5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer group ${
                selectedCustomer === c.phone ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-border"
              }`}
              onClick={() => setSelectedCustomer(selectedCustomer === c.phone ? null : c.phone)}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Avatar & Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <span className="text-xl font-black text-emerald-600">{(c.name || "?")[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">{c.name || "بدون اسم"}</h3>
                      {c.tags?.includes("vip") && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-mono" dir="ltr">{c.phone}</p>
                    {(c.wilaya || c.city) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {c.city}{c.wilaya ? `، ${c.wilaya}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-left shrink-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
                      {c.orderCount} طلب
                    </Badge>
                    <span className="font-black text-xl text-primary">
                      {(c.totalSpent || 0).toLocaleString("ar-DZ")}
                    </span>
                    <span className="text-xs text-muted-foreground">دج</span>
                  </div>
                  {c.lastOrderDate && (
                    <p className="text-xs text-muted-foreground">
                      آخر طلب: {new Date(c.lastOrderDate).toLocaleDateString("ar-DZ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedCustomer === c.phone && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">الوسوم:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            c.tags?.includes(tag.id)
                              ? tag.color
                              : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/50"
                          }`}
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">ملاحظات:</label>
                    <textarea
                      className="w-full border border-border rounded-xl p-3 text-sm bg-background min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="ملاحظات حول الزبون..."
                      defaultValue={c.note}
                      onClick={(e) => e.stopPropagation()}
                      onChange={async (e) => {
                        await saveCustomerNote({ phone: c.phone, note: e.target.value });
                        toast.success("تم حفظ الملاحظة");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}