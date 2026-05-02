import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Search, Eye, X, MessageCircle, MapPin, Package, Phone, Calendar } from "lucide-react";
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
  delivered: "مكتمل (تم التوصيل)",
  cancelled: "ملغى",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function AdminOrdersTab() {
  const orders = useQuery(api.orders.listAllOrders, {});
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({ orderId: orderId as any, status: newStatus });
      toast.success("تم تحديث حالة الطلب بنجاح");
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const openWhatsApp = (phone: string) => {
    // Add international code for Algeria if starts with 0
    let waPhone = phone.replace(/\s+/g, '');
    if (waPhone.startsWith('0')) {
      waPhone = '213' + waPhone.substring(1);
    }
    window.open(`https://wa.me/${waPhone}`, '_blank');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (orders === undefined) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-black text-foreground">إدارة الطلبات</h1>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
          <button
            onClick={() => setStatusFilter("all")}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === "all" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            الكل
          </button>
          {Object.entries(statusLabels).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === val ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {label}
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
                <th className="px-4 py-4 font-bold">رقم الطلب</th>
                <th className="px-4 py-4 font-bold">التاريخ</th>
                <th className="px-4 py-4 font-bold">العميل</th>
                <th className="px-4 py-4 font-bold">المدينة</th>
                <th className="px-4 py-4 font-bold">الحالة</th>
                <th className="px-4 py-4 font-bold">الإجمالي</th>
                <th className="px-4 py-4 font-bold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    لا توجد طلبات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className="hover:bg-muted/20 transition-colors cursor-pointer group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                      {formatDate(order._creationTime)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5" dir="ltr">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {order.customerCity.split(' - ')[0]} {/* Show only wilaya in table */}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[order.status]}`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-black text-primary whitespace-nowrap">
                      {order.total.toLocaleString("ar-DZ")} دج
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Button variant="ghost" size="icon" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
                    <span className="text-muted-foreground font-mono text-sm font-normal">#{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}</span>
                  </h2>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(selectedOrder._creationTime)}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Status Updater */}
                <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                  <h3 className="text-sm font-bold text-foreground mb-3">حالة الطلب</h3>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(statusLabels).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => handleStatusChange(selectedOrder._id, val)}
                        className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all flex-1 text-center ${
                          selectedOrder.status === val 
                            ? statusColors[val] + " shadow-sm scale-105" 
                            : "bg-background border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Phone className="w-4 h-4 text-primary" />
                    بيانات العميل
                  </h3>
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">الاسم</span>
                      <span className="font-bold text-foreground text-left">{selectedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">الهاتف</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground" dir="ltr">{selectedOrder.customerPhone}</span>
                        <Button size="icon" variant="outline" className="w-7 h-7 rounded-full bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700" onClick={() => openWhatsApp(selectedOrder.customerPhone)}>
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">البريد</span>
                        <span className="font-bold text-foreground text-left" dir="ltr">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="space-y-4">
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
                      <span className="font-bold text-foreground text-left leading-relaxed">{selectedOrder.customerAddress}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="pt-3 mt-3 border-t border-border border-dashed">
                        <span className="text-xs text-muted-foreground block mb-1">ملاحظات التوصيل:</span>
                        <p className="text-foreground bg-amber-50 text-amber-900 p-2 rounded-lg text-xs leading-relaxed border border-amber-200">
                          {selectedOrder.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                    <Package className="w-4 h-4 text-primary" />
                    المنتجات ({selectedOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex gap-3 bg-card border border-border p-3 rounded-xl">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-foreground">{item.productName}</div>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                            {item.weight && <Badge variant="secondary" className="text-[10px] px-1.5 font-normal">{item.weight}</Badge>}
                            {item.taste && <Badge variant="outline" className="text-[10px] px-1.5 font-normal">{item.taste}</Badge>}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <div className="text-sm font-black text-foreground">{item.price.toLocaleString("ar-DZ")} دج</div>
                          <div className="text-xs text-muted-foreground mt-1">الكمية: {item.quantity}</div>
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
                    <span>المنتجات (المجموع الجزئي)</span>
                    <span>{selectedOrder.subtotal.toLocaleString("ar-DZ")} دج</span>
                  </div>
                  {selectedOrder.discount && selectedOrder.discount > 0 ? (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>خصم (كوبون {selectedOrder.couponCode})</span>
                      <span>-{selectedOrder.discount.toLocaleString("ar-DZ")} دج</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-muted-foreground">
                    <span>التوصيل</span>
                    <span>{selectedOrder.discount ? (selectedOrder.total - selectedOrder.subtotal + selectedOrder.discount).toLocaleString("ar-DZ") : (selectedOrder.total - selectedOrder.subtotal).toLocaleString("ar-DZ")} دج</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="font-bold text-foreground">الإجمالي الكلي</span>
                  <span className="text-2xl font-black text-primary">{selectedOrder.total.toLocaleString("ar-DZ")} دج</span>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
