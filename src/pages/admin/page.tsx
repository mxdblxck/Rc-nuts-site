import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  Package, ShoppingCart, Users, Tag, LayoutDashboard,
  TrendingUp, CheckCircle, Clock, Trash2, ToggleLeft, ToggleRight, Plus, Edit,
<<<<<<< HEAD
  AlertTriangle, LogOut, Settings, Gift,
=======
  AlertTriangle, LogOut, Settings,
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.tsx";
import AdminProductForm from "./_components/AdminProductForm.tsx";
import AdminCouponForm from "./_components/AdminCouponForm.tsx";
import AdminShippingForm from "./_components/AdminShippingForm.tsx";
import AdminOrdersTab from "./_components/AdminOrdersTab.tsx";
<<<<<<< HEAD
import AdminPacksTab from "./_components/AdminPacksTab.tsx";
import DashboardTab from "./_components/DashboardTab.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "coupons" | "shipping" | "packs";
=======
import DashboardTab from "./_components/DashboardTab.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "coupons" | "shipping";
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function AdminContent() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Doc<"products"> | null>(null);
  const [showCouponForm, setShowCouponForm] = useState(false);

  const currentUser = useQuery(api.users.getCurrentUser, {});
  const stats = useQuery(api.orders.getOrderStats, {});
  const orders = useQuery(api.orders.listAllOrders, {});
  const products = useQuery(api.products.listProducts, {});
  const customerStats = useQuery(api.orders.getCustomerStats, {});
  const coupons = useQuery(api.coupons.listCoupons, {});
  const saveCustomerNote = useMutation(api.orders.saveCustomerNote);
  const [editingNoteFor, setEditingNoteFor] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const deleteProduct = useMutation(api.products.deleteProduct);
  const updateProduct = useMutation(api.products.updateProduct);
  const toggleCoupon = useMutation(api.coupons.toggleCoupon);

  if (currentUser === undefined) {
    return <div className="p-8"><Skeleton className="h-32 w-full" /></div>;
  }

  if (!currentUser || currentUser.role !== "admin") {
    // Auth bypassed for local development
  }

  const navItems = [
    { id: "dashboard" as AdminTab, label: "الإحصائيات", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "products" as AdminTab, label: "المنتجات", icon: <Package className="w-4 h-4" /> },
    { id: "orders" as AdminTab, label: "الطلبات", icon: <ShoppingCart className="w-4 h-4" /> },
    { id: "customers" as AdminTab, label: "العملاء", icon: <Users className="w-4 h-4" /> },
    { id: "coupons" as AdminTab, label: "الكوبونات", icon: <Tag className="w-4 h-4" /> },
<<<<<<< HEAD
    { id: "packs" as AdminTab, label: "الباقات", icon: <Gift className="w-4 h-4" /> },
    { id: "shipping" as AdminTab, label: "الشحن", icon: <Package className="w-4 h-4" /> },
=======
    { id: "shipping" as AdminTab, label: "الشحن", icon: <Package className="w-4 h-4" /> }, // could use a Truck icon if available
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
  ];

  const handleEditProduct = (product: Doc<"products">) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleCloseForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleToggleStock = async (product: Doc<"products">) => {
    const newInStock = !product.inStock;
    await updateProduct({
      id: product._id,
      inStock: newInStock,
      stockQuantity: newInStock ? (product.stockQuantity ?? 10) : 0,
    });
    toast.success(newInStock ? "تم تفعيل المنتج في المخزن" : "تم تحديد المنتج كـ نفذت الكمية");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-l border-border shrink-0 shadow-sm">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">R</div>
            <div>
              <h2 className="font-black text-sm text-foreground">RC Nuts Admin</h2>
              <p className="text-[10px] text-muted-foreground">لوحة التحكم</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                tab === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === "orders" && orders && orders.filter((o: any) => o.status === "pending").length > 0 && (
                <span className="mr-auto text-[10px] bg-yellow-500 text-white rounded-full px-1.5 py-0.5 font-bold">
                  {orders.filter((o: any) => o.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">RC Nuts © 2026</div>
        </div>
      </aside>

      {/* Mobile bottom tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around z-40 px-2 py-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors cursor-pointer ${
              tab === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            <span className="text-[9px]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6">

          {/* Dashboard */}
          {tab === "dashboard" && (
            <DashboardTab stats={stats} products={products ?? []} orders={orders ?? []} />
          )}

          {/* Products */}
          {tab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-foreground">إدارة المنتجات</h1>
                <Button
                  onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                  className="gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إضافة منتج
                </Button>
              </div>

              {showProductForm && (
                <div className="mb-6">
                  <AdminProductForm
                    onClose={handleCloseForm}
                    editProduct={editingProduct}
                  />
                </div>
              )}

              {products === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((p) => (
                    <div
                      key={p._id}
                      className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${
                        !p.inStock ? "border-destructive/30 bg-destructive/5" : "border-border"
                      }`}
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.nameAr}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground truncate">{p.nameAr}</span>
                          {!p.inStock && (
                            <Badge variant="destructive" className="text-[10px] shrink-0">
                              نفذت الكمية
                            </Badge>
                          )}
                          {p.featured && (
                            <Badge className="text-[10px] shrink-0 bg-accent text-accent-foreground">
                              مميز
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {p.category} • {p.price.toLocaleString("ar-DZ")} دج
                        </div>
                        <div className="text-xs mt-0.5 flex items-center gap-1">
                          {p.inStock ? (
                            <span className={`font-medium ${p.stockQuantity !== undefined && p.stockQuantity < 5 ? "text-orange-500" : "text-primary"}`}>
                              الكمية: {p.stockQuantity ?? "غير محددة"}
                              {p.stockQuantity !== undefined && p.stockQuantity < 5 && " (كمية قليلة!)"}
                            </span>
                          ) : (
                            <span className="text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              نفذت الكمية
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle stock */}
                        <button
                          onClick={() => handleToggleStock(p)}
                          title={p.inStock ? "تحديد كـ نفذت الكمية" : "تفعيل المخزن"}
                          className={`text-sm px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                            p.inStock
                              ? "border-primary/30 text-primary hover:bg-primary/10"
                              : "border-destructive/30 text-destructive hover:bg-destructive/10"
                          }`}
                        >
                          {p.inStock ? "متوفر ✓" : "نفذ ✗"}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEditProduct(p)}
                          className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-1"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={async () => {
                            if (confirm(`هل تريد حذف "${p.nameAr}"؟`)) {
                              await deleteProduct({ id: p._id });
                              toast.success("تم حذف المنتج");
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-1"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders */}
          {tab === "orders" && <AdminOrdersTab />}

<<<<<<< HEAD
          {/* Packs */}
          {tab === "packs" && <AdminPacksTab />}

=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
          {/* Customers */}
          {tab === "customers" && (
            <div>
              <h1 className="text-2xl font-black text-foreground mb-6">إدارة العملاء (CRM)</h1>
              {customerStats === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
                </div>
              ) : customerStats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">لا يوجد عملاء بعد</div>
              ) : (
                <div className="space-y-4">
                  {customerStats.map((c: any) => (
                    <div key={c.phone} className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-xl">
                            {(c.name ?? "؟")[0]}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-lg">{c.name}</div>
                            <div className="text-sm text-muted-foreground" dir="ltr">{c.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="secondary" className="px-3 py-1 text-sm">
                            {c.orderCount} طلبات
                          </Badge>
                          <span className="font-black text-primary text-lg">
                            {c.totalSpent.toLocaleString("ar-DZ")} دج
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-bold text-sm mb-2 text-foreground">ملاحظات الإدارة:</div>
                        {editingNoteFor === c.phone ? (
                          <div className="space-y-2">
                            <textarea 
                              className="w-full border border-border rounded-lg p-2 text-sm bg-background min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              placeholder="أضف ملاحظة حول العميل (مثال: يفضل التوصيل مساءً)..."
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={async () => {
                                  await saveCustomerNote({ phone: c.phone, note: tempNote });
                                  setEditingNoteFor(null);
                                  toast.success("تم حفظ الملاحظة");
                                }}
                              >
                                حفظ
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingNoteFor(null)}>إلغاء</Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="w-full border border-border rounded-lg p-3 text-sm bg-muted/30 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => {
                              setTempNote(c.note);
                              setEditingNoteFor(c.phone);
                            }}
                          >
                            {c.note ? (
                              <p className="text-foreground whitespace-pre-wrap">{c.note}</p>
                            ) : (
                              <p className="text-muted-foreground italic text-xs mt-1">لا توجد ملاحظات... انقر للإضافة</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Coupons */}
          {tab === "coupons" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black text-foreground">الكوبونات والعروض</h1>
                <Button onClick={() => setShowCouponForm(true)} className="gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  إضافة كوبون
                </Button>
              </div>
              {showCouponForm && (
                <div className="mb-6">
                  <AdminCouponForm onClose={() => setShowCouponForm(false)} />
                </div>
              )}
              {coupons === undefined ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : coupons.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">لا توجد كوبونات بعد</div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((c) => (
                    <div key={c._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground font-mono">{c.code}</div>
                        <div className="text-sm text-muted-foreground">
                          خصم {c.discountValue}{c.discountType === "percentage" ? "%" : " دج"}{" "}
                          • استخدم {c.usedCount} مرة
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await toggleCoupon({ id: c._id, active: !c.active });
                          toast.success(c.active ? "تم تعطيل الكوبون" : "تم تفعيل الكوبون");
                        }}
                        className="cursor-pointer"
                      >
                        {c.active
                          ? <ToggleRight className="w-7 h-7 text-primary" />
                          : <ToggleLeft className="w-7 h-7 text-muted-foreground" />}
                      </button>
                      <Badge variant={c.active ? "default" : "secondary"}>
                        {c.active ? "فعال" : "معطل"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shipping */}
          {tab === "shipping" && (
            <AdminShippingForm />
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <AdminContent />
    </div>
  );
}
