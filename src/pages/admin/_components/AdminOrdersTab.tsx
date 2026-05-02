import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Search, Eye, X, MessageCircle, MapPin, Package,
  Phone, Calendar, Trash2, ChevronDown, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  shipped: "مشحون",
  delivered: "مكتمل",
  cancelled: "ملغى",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

// Status flow: which statuses can follow the current one
const statusFlow: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersTab() {
  const orders = useQuery(api.orders.listAllOrders, {});
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const deleteOrder = useMutation(api.orders.deleteOrder);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchesSearch =
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Count per status for badges
  const countByStatus = useMemo(() => {
    if (!orders) return {} as Record<string, number>;
    return orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status: newStatus });
      toast.success("تم تحديث حالة الطلب");
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async (orderId: string, orderName: string) => {
    try {
      await deleteOrder({ orderId: orderId as any });
      toast.success(`تم حذف طلب ${orderName}`);
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
      setConfirmDeleteId(null);
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openWhatsApp = (phone: string) => {
    let waPhone = phone.replace(/\s+/g, "");
    if (waPhone.startsWith("0")) waPhone = "213" + waPhone.substring(1);
    window.open(`https://wa.me/${waPhone}`, "_blank");
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (orders === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">إدارة الطلبات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders.length} طلب إجمالاً •{" "}
            <span className="text-amber-600 font-medium">
              {countByStatus["pending"] ?? 0} قيد الانتظار
            </span>
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Status tabs with counts */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setStatusFilter("all")}
            className={`whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            الكل
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === "all" ? "bg-white/20" : "bg-muted"}`}>
              {orders.length}
            </span>
          </button>
          {Object.entries(statusLabels).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                statusFilter === val
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
              {(countByStatus[val] ?? 0) > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === val ? "bg-white/20" : val === "pending" ? "bg-amber-100 text-amber-700" : "bg-muted"
                }`}>
                  {countByStatus[val]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف..."
            className="pr-10 bg-muted/30 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-bold">رقم الطلب</th>
                <th className="px-4 py-3 font-bold">التاريخ</th>
                <th className="px-4 py-3 font-bold">العميل</th>
                <th className="px-4 py-3 font-bold hidden md:table-cell">الولاية</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">الإجمالي</th>
                <th className="px-4 py-3 font-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    لا توجد طلبات مطابقة
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                      {formatDate(order._creationTime)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {order.customerCity.split(" - ")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-black text-primary whitespace-nowrap">
                      {order.total.toLocaleString("ar-DZ")} دج
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* View details */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 hover:bg-primary/10 hover:text-primary"
                          title="عرض التفاصيل"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* Delete */}
                        {confirmDeleteId === order._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(order._id, order.customerName)}
                              className="text-[10px] px-2 py-1 bg-destructive text-white rounded-lg font-bold hover:bg-destructive/90 transition-colors"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] px-2 py-1 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                            title="حذف الطلب"
                            onClick={() => setConfirmDeleteId(order._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 0 && (
          <div className="px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground text-left">
            عرض {filteredOrders.length} من {orders.length} طلب
          </div>
        )}
      </div>

      {/* Order Details Slide-Over */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-2xl border-l border-border flex flex-col overflow-hidden"
              dir="rtl"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card shrink-0">
                <div>
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    تفاصيل الطلب
                    <span className="text-muted-foreground font-mono text-sm font-normal">
                      #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                    </span>
                  </h2>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedOrder._creationTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Delete from slide-over */}
                  {confirmDeleteId === selectedOrder._id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(selectedOrder._id, selectedOrder.customerName)}
                        className="text-xs px-3 py-1.5 bg-destructive text-white rounded-lg font-bold hover:bg-destructive/90 transition-colors flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        تأكيد الحذف
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-xs px-3 py-1.5 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(selectedOrder._id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      title="حذف الطلب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedOrder(null); setConfirmDeleteId(null); }}
                    className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Status Updater */}
                <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-foreground">حالة الطلب</h3>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[selectedOrder.status]}`}>
                      {statusLabels[selectedOrder.status] ?? selectedOrder.status}
                    </span>
                  </div>
                  {/* Show all statuses, highlight current, dim unavailable */}
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(statusLabels).map(([val, label]) => {
                      const isCurrent = selectedOrder.status === val;
                      const isAvailable = statusFlow[selectedOrder.status]?.includes(val);
                      return (
                        <button
                          key={val}
                          onClick={() => isAvailable && handleStatusChange(selectedOrder._id, val)}
                          disabled={!isAvailable && !isCurrent}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex-1 text-center ${
                            isCurrent
                              ? statusColors[val] + " shadow-sm scale-105"
                              : isAvailable
                              ? "bg-background border-border text-foreground hover:bg-muted cursor-pointer"
                              : "bg-muted/30 border-border/50 text-muted-foreground/50 cursor-not-allowed"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {statusFlow[selectedOrder.status]?.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      هذا الطلب في حالته النهائية
                    </p>
                  )}
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Phone className="w-4 h-4 text-primary" />
                    بيانات العميل
                  </h3>
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">الاسم</span>
                      <span className="font-bold text-foreground">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">الهاتف</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground" dir="ltr">
                          {selectedOrder.customerPhone}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="w-7 h-7 rounded-full bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                          onClick={() => openWhatsApp(selectedOrder.customerPhone)}
                          title="واتساب"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    عنوان التوصيل
                  </h3>
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-muted-foreground shrink-0">المدينة</span>
                      <span className="font-bold text-foreground text-left">{selectedOrder.customerCity}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-muted-foreground shrink-0">العنوان</span>
                      <span className="font-bold text-foreground text-left leading-relaxed">
                        {selectedOrder.customerAddress}
                      </span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="pt-3 mt-1 border-t border-dashed border-border">
                        <span className="text-xs text-muted-foreground block mb-1">ملاحظات التوصيل:</span>
                        <p className="text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-lg text-xs leading-relaxed">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Package className="w-4 h-4 text-primary" />
                    المنتجات ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-3 bg-card border border-border p-3 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-foreground">{item.productName}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-1.5">
                            {item.weight && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 font-normal">
                                {item.weight}
                              </Badge>
                            )}
                            {item.taste && (
                              <Badge variant="outline" className="text-[10px] px-1.5 font-normal">
                                {item.taste}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="text-sm font-black text-foreground">
                            {(item.price * item.quantity).toLocaleString("ar-DZ")} دج
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.price.toLocaleString("ar-DZ")} × {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Payment Summary */}
              <div className="bg-muted/20 p-6 border-t border-border shrink-0">
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الجزئي</span>
                    <span>{selectedOrder.subtotal.toLocaleString("ar-DZ")} دج</span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 ? (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>خصم {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}</span>
                      <span>-{selectedOrder.discount.toLocaleString("ar-DZ")} دج</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-muted-foreground">
                    <span>التوصيل</span>
                    <span>
                      {(
                        selectedOrder.total -
                        selectedOrder.subtotal +
                        (selectedOrder.discount ?? 0)
                      ).toLocaleString("ar-DZ")}{" "}
                      دج
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="font-bold text-foreground">الإجمالي الكلي</span>
                  <span className="text-2xl font-black text-primary">
                    {selectedOrder.total.toLocaleString("ar-DZ")} دج
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
