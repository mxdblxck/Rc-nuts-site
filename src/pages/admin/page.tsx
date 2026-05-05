import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Link } from "react-router-dom";
import {
  Package, ShoppingCart, Users, Tag, LayoutDashboard,
  LogOut, Settings, Gift, Truck, Plus, ToggleLeft, ToggleRight, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.tsx";
import AdminProductForm from "./_components/AdminProductForm.tsx";
import AdminCouponForm from "./_components/AdminCouponForm.tsx";
import AdminShippingForm from "./_components/AdminShippingForm.tsx";
import AdminProductsTab from "./_components/AdminProductsTab.tsx";
import AdminOrdersTab from "./_components/AdminOrdersTab.tsx";
import AdminCustomersTab from "./_components/AdminCustomersTab.tsx";
import AdminPacksTab from "./_components/AdminPacksTab.tsx";
import DashboardTab from "./_components/DashboardTab.tsx";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "coupons" | "shipping" | "packs";

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
    { id: "dashboard" as AdminTab, label: "الإحصائيات", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "products" as AdminTab, label: "المنتجات", icon: <Package className="w-5 h-5" /> },
    { id: "orders" as AdminTab, label: "الطلبات", icon: <ShoppingCart className="w-5 h-5" /> },
    { id: "customers" as AdminTab, label: "الزبائن", icon: <Users className="w-5 h-5" /> },
    { id: "coupons" as AdminTab, label: "الكوبونات", icon: <Tag className="w-5 h-5" /> },
    { id: "packs" as AdminTab, label: "الباقات", icon: <Gift className="w-5 h-5" /> },
    { id: "shipping" as AdminTab, label: "الشحن", icon: <Truck className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_session");
    window.location.href = "/admin/login";
  };

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
      {/* Premium Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-l border-border shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-black text-xl shadow-md">
              R
            </div>
            <div>
              <p className="font-black text-foreground leading-tight">RC Nuts</p>
              <p className="text-[11px] text-muted-foreground">لوحة التحكم</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = tab === item.id;
            const pendingCount = item.id === "orders" && orders ? orders.filter((o: any) => o.status === "pending").length : 0;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className={isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {pendingCount > 0 && (
                  <span className="mr-auto text-[10px] bg-amber-500 text-white rounded-full px-2 py-0.5 font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/admin/settings"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            <Settings className="w-5 h-5" />
            الإعدادات
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
          <p className="text-[11px] text-muted-foreground text-center pt-2 border-t border-border mt-1">
            RC Nuts © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border flex justify-around z-40 px-2 py-2 shadow-xl">
        {navItems.slice(0, 5).map((item) => {
          const isActive = tab === item.id;
          const pendingCount = item.id === "orders" && orders ? orders.filter((o: any) => o.status === "pending").length : 0;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-bold">{item.label}</span>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[9px] bg-amber-500 text-white rounded-full flex items-center justify-center font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <div className="p-5 md:p-8 bg-background min-h-full">

          {/* Dashboard */}
          {tab === "dashboard" && (
            <DashboardTab stats={stats} products={products ?? []} orders={orders ?? []} />
          )}

          {/* Products */}
          {tab === "products" && <AdminProductsTab products={products} />}

          {/* Orders */}
          {tab === "orders" && <AdminOrdersTab />}

          {/* Packs */}
          {tab === "packs" && <AdminPacksTab />}

          {/* Customers */}
          {tab === "customers" && <AdminCustomersTab customerStats={customerStats} />}

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
